import { Effect, ManagedRuntime, Schedule, Schema } from "effect";
import { Database } from "@/lib/effect/database";
import { Order, User, type UserWithOrders } from "@/lib/effect/schemas";

class InvalidUserIdError extends Schema.TaggedError<InvalidUserIdError>()("InvalidUserIdError", {
  id: Schema.String,
}) {}

class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()("UserNotFoundError", {
  id: Schema.Number,
}) {}

// The id from the URL: a string that must contain a positive integer
const UserId = Schema.NumberFromString.pipe(Schema.check(Schema.isInt()), Schema.check(Schema.isGreaterThan(0)));

// Built once, shared by every request: it provides the Database service.
// - Effect.provide(layer) fournit les dépendances pour une exécution. 
// - ManagedRuntime.make(layer) les fournit pour toute la durée de vie de l'application
// On est trés proche en .NET de : services.AddSingleton<IDatabase, Database.layer>();
const runtime = ManagedRuntime.make(Database.layer);

// The signature tells everything: Effect<User, DatabaseError | UserNotFoundError | SchemaError, Database>
const getUser = Effect.fn("getUser")(function* (id: number) {
  
  // 1. Get the database connection
  const database = yield* Database;

  // 2. Find the user by id, retrying on transient database errors
  const row = yield* database.findUserById(id).pipe(
    Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 }),
  );
  
  // 3. If no user is found, return a UserNotFoundError
  if (row === null) return yield* new UserNotFoundError({ id });

  // 4. Decode and validate the user data from the database
    return yield* Schema.decodeUnknownEffect(User)(row);
});

// Effect<ReadonlyArray<Order>, DatabaseError | SchemaError, Database>
const getOrders = Effect.fn("getOrders")(function* (userId: number) {

  const database = yield* Database;
  
  const rows = yield* database.findOrdersByUserId(userId).pipe(
    Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 }),
  );

  return yield* Schema.decodeUnknownEffect(Schema.Array(Order))(rows);
});

// GET /api/users-effect/:id → the user and their orders
export async function GET(_request: Request, { params }: RouteContext<"/api/users-effect/[id]">) {
  const { id: rawId } = await params;

  // Effect<Response, never, Database>: needs a Database, and every error is handled (never).
  const program = Effect.gen(function* () {
    
    // 1. Validate the id from the URL
    const id = yield* Schema.decodeUnknownEffect(UserId)(rawId).pipe(
      Effect.mapError(() => new InvalidUserIdError({ id: rawId })),
    );

    // 2. The user and their orders, in parallel: if one fails, the other is interrupted
    const [user, orders] = yield* Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" });

    const body: UserWithOrders = { ...user, orders };

    return Response.json(body);
  }).pipe(
    // Every possible error is in the type: one handler per tag, checked by the compiler
    Effect.catchTags({
      InvalidUserIdError: (error) =>
        Effect.succeed(Response.json({ error: error._tag, message: `Invalid user id: "${error.id}"` }, { status: 400 })),
      UserNotFoundError: (error) =>
        Effect.succeed(Response.json({ error: error._tag, message: `User ${error.id} not found` }, { status: 404 })),
      DatabaseError: (error) =>
        Effect.logError(error).pipe(
          Effect.as(Response.json({ error: "DatabaseError", message: "Database unavailable" }, { status: 503 })),
        ),
      SchemaError: (error) =>
        Effect.logError(error).pipe(
          Effect.as(
            Response.json(
              { error: "ValidationError", message: "Invalid user or order data", issues: error.message },
              { status: 500 },
            ),
          ),
        ),
    }),
    // Defects (bugs) are not in the type: handled once, here, at the boundary
    Effect.catchDefect((defect) =>
      Effect.logError(defect).pipe(
        Effect.as(Response.json({ error: "InternalError", message: "Unexpected error" }, { status: 500 })),
      ),
    ),
  );

  return runtime.runPromise(program);
}
