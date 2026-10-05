import express, {
    type ErrorRequestHandler,
    type Request,
    type Response,
} from "express";

type User = {
    readonly id: number;
    readonly name: string;
    readonly email: string;
};

type Order = {
    readonly id: number;
    readonly userId: number;
    readonly amount: number;
};

type UserSummary = {
    readonly user: User;
    readonly orderCount: number;
    readonly totalAmount: number;
};

class UserNotFound extends Error {
    readonly id: number;

    constructor(id: number) {
        super(`User ${id} not found`);
        this.id = id;
    }
}

class UserLoadFailed extends Error {
    constructor(id: number, cause: unknown) {
        super(`Could not load user ${id}`, { cause });
    }
}

class OrdersLoadFailed extends Error {
    constructor(id: number, cause: unknown) {
        super(`Could not load orders for user ${id}`, { cause });
    }
}

class RequestTimeout extends Error {}

// Une base renvoie des données externes : leur type réel est unknown.
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

const wait = (milliseconds: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

async function findUser(id: number): Promise<User> {
    console.log(`[classic] start user ${id}`);
    await wait(150);

    const row = userRows.get(id);
    if (row === undefined) {
        throw new UserNotFound(id);
    }

    console.log(`[classic] end user ${id}`);

    // Le cast rassure TypeScript, mais ne valide rien à l'exécution.
    return row as User;
}

async function findOrders(id: number): Promise<ReadonlyArray<Order>> {
    console.log(`[classic] start orders ${id}`);
    await wait(id === 4 ? 1_000 : 250);
    console.log(`[classic] end orders ${id}`);

    return (orderRows.get(id) ?? []) as ReadonlyArray<Order>;
}

async function buildSummary(id: number): Promise<UserSummary> {
    // Les deux Promises s'exécutent en concurrence, mais allSettled attend les
    // deux résultats, même si l'une échoue rapidement.
    const [userResult, ordersResult] = await Promise.allSettled([
        findUser(id),
        findOrders(id),
    ]);

    try {
        let user: User;

        try {
            if (userResult.status === "rejected") {
                // PromiseRejectedResult.reason est typé any par JavaScript.
                const reason = userResult.reason as unknown;

                if (reason instanceof UserNotFound) {
                    throw reason;
                }

                throw new UserLoadFailed(id, reason);
            }

            user = userResult.value;
        } catch (error: unknown) {
            // On doit préserver manuellement l'erreur métier.
            if (error instanceof UserNotFound) {
                throw error;
            }

            if (error instanceof UserLoadFailed) {
                throw error;
            }

            throw new UserLoadFailed(id, error);
        }

        try {
            if (ordersResult.status === "rejected") {
                const reason = ordersResult.reason as unknown;
                throw new OrdersLoadFailed(id, reason);
            }

            const orders = ordersResult.value;

            return {
                user,
                orderCount: orders.length,
                totalAmount: orders.reduce(
                    (total, order) => total + order.amount,
                    0,
                ),
            };
        } catch (error: unknown) {
            if (error instanceof OrdersLoadFailed) {
                throw error;
            }

            throw new OrdersLoadFailed(id, error);
        }
    } catch (error: unknown) {
        // Sans ces tests, ce catch risque de masquer le type d'erreur initial.
        if (
            error instanceof UserNotFound ||
            error instanceof UserLoadFailed ||
            error instanceof OrdersLoadFailed
        ) {
            throw error;
        }

        throw new Error(`Could not build summary for user ${id}`, {
            cause: error,
        });
    }
}

function withTimeout<A>(promise: Promise<A>, milliseconds: number): Promise<A> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new RequestTimeout()),
            milliseconds,
        );

        promise.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (error: unknown) => {
                clearTimeout(timer);
                reject(
                    error instanceof Error
                        ? error
                        : new Error("Promise rejected with a non-Error value", {
                            cause: error,
                        }),
                );
            },
        );
    });
}

/**
 * Node exécute le JavaScript sur un thread principal, mais plusieurs requêtes
 * peuvent s'entrelacer pendant les await. Cette mise à jour peut donc perdre
 * un incrément lorsque deux requêtes terminent en même temps.
 */
let completedRequests = 0;

async function incrementCompletedRequests(): Promise<void> {
    const currentValue = completedRequests;
    await wait(25);
    completedRequests = currentValue + 1;
}

const app = express();

app.get(
    "/users/:id/summary",
    async (request: Request, response: Response): Promise<void> => {
        // Express fournit une string. La validation est entièrement manuelle.
        const id = Number(request.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            response.status(400).json({ error: "id must be a positive integer" });
            return;
        }

        try {
            // Promise.race répond au timeout, mais n'annule pas le travail lancé.
            const summary = await withTimeout(buildSummary(id), 500);
            await incrementCompletedRequests();
            response.json(summary);
        } catch (error: unknown) {
            // Promise<UserSummary> ne décrit pas les erreurs possibles.
            if (error instanceof UserNotFound) {
                response.status(404).json({ error: error.message });
                return;
            }

            if (error instanceof RequestTimeout) {
                response.status(504).json({ error: "request timed out" });
                return;
            }

            if (
                error instanceof UserLoadFailed ||
                error instanceof OrdersLoadFailed
            ) {
                console.error(error);
                response.status(500).json({ error: error.message });
                return;
            }

            console.error(error);
            response.status(500).json({ error: "internal server error" });
        }
    },
);

app.get("/stats", (_request: Request, response: Response) => {
    response.json({ completedRequests });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: "unhandled error" });
};

app.use(errorHandler);

// Une valeur invalide dans CLASSIC_PORT n'est pas détectée avant listen().
const port = Number(process.env.CLASSIC_PORT ?? 3000);

app.listen(port, () => {
    console.log(`Classic server: http://localhost:${port}`);
});
