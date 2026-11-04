import { Context, Effect, Layer, Schema } from "effect";
import { db } from "../db";

// The same simulated database as the classic version, exposed as an Effect service.
export class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", {
  cause: Schema.Defect(),
}) {}

// A rejected promise becomes a typed DatabaseError (logged, like lib/retry.ts does).
const query = <A>(name: string, run: () => Promise<A>) =>
  Effect.tryPromise({ try: run, catch: (cause) => new DatabaseError({ cause }) }).pipe(
    Effect.tapError((error) => Effect.logWarning(`${name} failed`, error.cause)),
    Effect.withSpan(name),
  );

// The rows are `unknown`: they come from outside our code, the routes validate them with Schema.
export class Database extends Context.Service<
  Database,
  {
    readonly findUsers: () => Effect.Effect<unknown, DatabaseError>;
    readonly findUserById: (id: number) => Effect.Effect<unknown, DatabaseError>;
    readonly findOrdersByUserId: (userId: number) => Effect.Effect<unknown, DatabaseError>;
  }
>()("@app/Database") {
  static readonly layer = Layer.succeed(Database, {
    findUsers: () => query("Database.findUsers", () => db.findUsers()),
    findUserById: (id) => query("Database.findUserById", () => db.findUserById(id)),
    findOrdersByUserId: (userId) => query("Database.findOrdersByUserId", () => db.findOrdersByUserId(userId)),
  });
}
