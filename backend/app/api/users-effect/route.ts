import { connection } from "next/server";
import { Effect, ManagedRuntime, Schedule, Schema } from "effect";
import { Database } from "@/lib/effect/database";
import { User } from "@/lib/effect/schemas";

// Built once, shared by every request: it provides the Database service.
const runtime = ManagedRuntime.make(Database.layer);

// GET /api/users-effect
export async function GET() {
  await connection(); // always run at request time, never prerendered at build time

  // Effect<Response, never, Database>: needs a Database, and every error is handled (never).
  const program= Effect.gen(function* () {
    const database = yield* Database;

    // 1. Read the users; the connection drops sometimes, so retry 3 times (100, 200, 400 ms)
    const rows = yield* database.findUsers().pipe(
      Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 }),
    );

    // 2. Validate what the database returned (fails with a SchemaError)
    const users = yield* Schema.decodeUnknownEffect(Schema.Array(User))(rows);

    return Response.json(users);
  }).pipe(
    // Every possible error is in the type: one handler per tag, checked by the compiler
    Effect.catchTags({
      DatabaseError: (error) =>
        Effect.logError(error).pipe(
          Effect.as(Response.json({ error: "DatabaseError", message: "Database unavailable" }, { status: 503 })),
        ),
      SchemaError: (error) =>
        Effect.logError(error).pipe(
          Effect.as(
            Response.json(
              { error: "ValidationError", message: "Invalid user data", issues: error.message },
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
