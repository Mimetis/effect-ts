import { connection } from "next/server";
import { z, ZodError } from "zod";
import { db, DatabaseError } from "@/lib/db";
import { retry } from "@/lib/retry";
import { UserSchema, type User } from "@/lib/schemas";

// GET /api/users
export async function GET() {
  await connection(); // always run at request time, never prerendered at build time

  try {
    // 1. Read the users; the connection drops sometimes, so retry 3 times
    const rows = await retry(() => db.findUsers(), { retries: 3, delayMs: 100 });

    // 2. Validate what the database returned (throws a ZodError)
    const users: User[] = z.array(UserSchema).parse(rows);

    return Response.json(users);
  } catch (error) {
    // `error` is `unknown`: we test every class we can think of
    if (error instanceof DatabaseError) {
      console.error(error);
      return Response.json({ error: "DatabaseError", message: "Database unavailable" }, { status: 503 });
    }
    if (error instanceof ZodError) {
      console.error(error);
      return Response.json({ error: "ValidationError", message: "Invalid user data", issues: error.issues }, { status: 500 });
    }
    console.error(error);
    return Response.json({ error: "InternalError", message: "Unexpected error" }, { status: 500 });
  }
}
