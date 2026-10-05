import express, {
    type ErrorRequestHandler,
    type Request,
    type Response,
} from "express";
import {
    Config,
    Console,
    Effect,
    Ref,
    Result,
    Schema,
} from "effect";

const UserIdFromString = Schema.FiniteFromString
    .check(Schema.isInt())
    .check(Schema.isGreaterThan(0));

const UserSchema = Schema.Struct({
    id: Schema.Int.check(Schema.isGreaterThan(0)),
    name: Schema.NonEmptyString,
    email: Schema.NonEmptyString,
});

const OrderSchema = Schema.Struct({
    id: Schema.Int.check(Schema.isGreaterThan(0)),
    userId: Schema.Int.check(Schema.isGreaterThan(0)),
    amount: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
});

const OrdersSchema = Schema.Array(OrderSchema);

type User = typeof UserSchema["Type"];
type Order = typeof OrderSchema["Type"];

type UserSummary = {
    readonly user: User;
    readonly orderCount: number;
    readonly totalAmount: number;
};

class InvalidRequest extends Error {
    readonly _tag = "InvalidRequest";
}

class UserNotFound extends Error {
    readonly _tag = "UserNotFound";
    readonly id: number;

    constructor(id: number) {
        super(`User ${id} not found`);
        this.id = id;
    }
}

class InvalidDatabaseData extends Error {
    readonly _tag = "InvalidDatabaseData";
    readonly details: string;

    constructor(details: string) {
        super("Invalid data returned by the database");
        this.details = details;
    }
}

const userRows = new Map<number, unknown>([
    [1, { id: 1, name: "Ada Lovelace", email: "ada@example.com" }],
    [2, { id: "2", name: "", email: null }],
    [4, { id: 4, name: "Grace Hopper", email: "grace@example.com" }],
]);

const orderRows = new Map<number, unknown>([
    [1, [{ id: 101, userId: 1, amount: 40 }, { id: 102, userId: 1, amount: 60 }]],
    [2, []],
    [4, [{ id: 401, userId: 4, amount: 100 }]],
]);

const decodeUserId = Schema.decodeUnknownEffect(UserIdFromString);
const decodeUser = Schema.decodeUnknownEffect(UserSchema);
const decodeOrders = Schema.decodeUnknownEffect(OrdersSchema);

const parseUserId = (input: unknown) =>
    Effect.mapError(
        decodeUserId(input),
        () => new InvalidRequest("id must be a positive integer"),
    );

const findUser = (id: number) =>
    Effect.onInterrupt(
        Effect.gen(function* () {
            yield* Console.log(`[effect] start user ${id}`);
            yield* Effect.sleep("150 millis");

            const row = userRows.get(id);
            if (row === undefined) {
                return yield* Effect.fail(new UserNotFound(id));
            }

            const user = yield* Effect.mapError(
                decodeUser(row),
                (error) => new InvalidDatabaseData(error.message),
            );

            yield* Console.log(`[effect] end user ${id}`);
            return user;
        }),
        () => Console.log(`[effect] interrupted user ${id}`),
    );

const findOrders = (id: number): Effect.Effect<ReadonlyArray<Order>, InvalidDatabaseData> =>
    Effect.onInterrupt(
        Effect.gen(function* () {
            yield* Console.log(`[effect] start orders ${id}`);
            yield* Effect.sleep(id === 4 ? "1 second" : "250 millis");

            const orders = yield* Effect.mapError(
                decodeOrders(orderRows.get(id) ?? []),
                (error) => new InvalidDatabaseData(error.message),
            );

            yield* Console.log(`[effect] end orders ${id}`);
            return orders;
        }),
        () => Console.log(`[effect] interrupted orders ${id}`),
    );

const buildSummary = (id: number): Effect.Effect<
    UserSummary,
    UserNotFound | InvalidDatabaseData
> =>
    Effect.gen(function* () {
        /**
         * mode: "result" est l'équivalent typé de Promise.allSettled :
         * - les deux fibres vont jusqu'au bout ;
         * - Effect.all ne propage pas directement la première erreur ;
         * - chaque valeur est un Result<Success, Error>.
         */
        const results = yield* Effect.all(
            {
                user: findUser(id),
                orders: findOrders(id),
            },
            {
                concurrency: 2,
                mode: "result",
            },
        );

        /**
         * Contrairement à PromiseRejectedResult.reason, failure n'est pas any :
         * - results.user.failure est UserNotFound | InvalidDatabaseData ;
         * - results.orders.failure est InvalidDatabaseData.
         *
         * On choisit ici de donner la priorité à l'erreur utilisateur.
         */
        if (Result.isFailure(results.user)) {
            return yield* Effect.fail(results.user.failure);
        }

        if (Result.isFailure(results.orders)) {
            return yield* Effect.fail(results.orders.failure);
        }

        const user = results.user.success;
        const orders = results.orders.success;

        return {
            user,
            orderCount: orders.length,
            totalAmount: orders.reduce(
                (total, order) => total + order.amount,
                0,
            ),
        };
    });

const getSummary = (rawId: unknown) =>
    Effect.gen(function* () {
        const id = yield* parseUserId(rawId);

        // Si le timeout gagne, Effect interrompt les fibres encore actives.
        return yield* Effect.timeout(buildSummary(id), "500 millis");
    });

// Ref.update réalise une mise à jour atomique malgré les requêtes concurrentes.
const completedRequests = Effect.runSync(Ref.make(0));

const app = express();

app.get(
    "/users/:id/summary",
    async (request: Request, response: Response): Promise<void> => {
        const requestEffect = Effect.gen(function* () {
            const summary = yield* getSummary(request.params.id);
            yield* Ref.update(completedRequests, (count) => count + 1);
            return summary;
        });

        const result = await Effect.runPromise(
            Effect.result(requestEffect),
        );

        if (Result.isSuccess(result)) {
            response.json(result.success);
            return;
        }

        const error = result.failure;

        switch (error._tag) {
            case "InvalidRequest":
                response.status(400).json({ error: error.message });
                break;
            case "UserNotFound":
                response.status(404).json({ error: error.message });
                break;
            case "InvalidDatabaseData":
                response.status(502).json({
                    error: error.message,
                    details: error.details,
                });
                break;
            case "TimeoutError":
                response.status(504).json({ error: error.message });
                break;
        }
    },
);

app.get("/stats", (_request: Request, response: Response) => {
    const count = Effect.runSync(Ref.get(completedRequests));
    response.json({ completedRequests: count });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: "unexpected defect" });
};

app.use(errorHandler);

const port = await Effect.runPromise(
    Config.withDefault(Config.Port("EFFECT_PORT"), 3001),
);

app.listen(port, () => {
    console.log(`Effect server: http://localhost:${port}`);
});
