import { z, ZodError } from "zod";
import { db, DatabaseError } from "@/lib/db";
import { retry } from "@/lib/retry";
import { OrderSchema, UserSchema, type Order, type User, type UserWithOrders } from "@/lib/schemas";

class InvalidUserIdError extends Error {
  constructor(readonly id: string) {
    super(`Invalid user id: "${id}"`);
    this.name = "InvalidUserIdError";
  }
}

class UserNotFoundError extends Error {
  constructor(readonly id: number) {
    super(`User ${id} not found`);
    this.name = "UserNotFoundError";
  }
}

// The signature says Promise<User>… and nothing about DatabaseError, UserNotFoundError or ZodError.
async function getUser(id: number): Promise<User> {
  const row = await retry(() => db.findUserById(id), { retries: 3, delayMs: 100 });
  if (!row) throw new UserNotFoundError(id);
  return UserSchema.parse(row);
}

async function getOrders(userId: number): Promise<Order[]> {
  const rows = await retry(() => db.findOrdersByUserId(userId), { retries: 3, delayMs: 100 });
  return z.array(OrderSchema).parse(rows);
}

// GET /api/users/:id → the user and their orders
export async function GET(_request: Request, { params }: RouteContext<"/api/users/[id]">) {
  try {
    // 1. Validate the id from the URL
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) throw new InvalidUserIdError(rawId);

    // 2. The user and their orders, in parallel
    const [user, orders] = await Promise.all([getUser(id), getOrders(id)]);

    const body: UserWithOrders = { ...user, orders };
    
    return Response.json(body);
    
  } catch (error) {
    // `error` is `unknown`: we test every class we can think of
    if (error instanceof InvalidUserIdError) {
      return Response.json({ error: error.name, message: error.message }, { status: 400 });
    }
    if (error instanceof UserNotFoundError) {
      return Response.json({ error: error.name, message: error.message }, { status: 404 });
    }
    if (error instanceof DatabaseError) {
      console.error(error);
      return Response.json({ error: "DatabaseError", message: "Database unavailable" }, { status: 503 });
    }
    if (error instanceof ZodError) {
      console.error(error);
      return Response.json({ error: "ValidationError", message: "Invalid user or order data", issues: error.issues }, { status: 500 });
    }
    console.error(error);
    return Response.json({ error: "InternalError", message: "Unexpected error" }, { status: 500 });
  }
}
