// Simulates the database client of a real project:
// every query takes some time, and the connection drops from time to time.

// What the database returns: outside our code, so nothing guarantees its shape.
export type UserRow = { id: number; name: string; email: string };
export type OrderRow = { id: number; userId: number; product: string; total: number };

const users: UserRow[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  { id: 2, name: "Alan Turing", email: "alan@example.com" },
  { id: 3, name: "Grace Hopper", email: "grace@example.com" },
  { id: 4, name: "Margaret Hamilton", email: "margaret@example.com" },
  { id: 5, name: "Linus Torvalds", email: "linus@example.com" },
  { id: 6, name: "Barbara Liskov", email: "barbara@example.com" },
];

const orders: OrderRow[] = [
  { id: 101, userId: 1, product: "Clavier", total: 89.9 },
  { id: 102, userId: 1, product: "Écran", total: 249 },
  { id: 103, userId: 2, product: "Souris", total: 39.5 },
  { id: 104, userId: 3, product: "Casque", total: 129 },
  { id: 105, userId: 3, product: "Webcam", total: 79 },
  { id: 106, userId: 3, product: "Micro", total: 99 },
  { id: 107, userId: 5, product: "Dock USB-C", total: 149 },
];

const FAILURE_RATE = 0.2;

// The error thrown by the database client, like a real driver would.
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

async function query<T>(run: () => T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 150));
  if (Math.random() < FAILURE_RATE) throw new DatabaseError("Connection reset by peer");
  return run();
}

export const db = {
  findUsers: () => query(() => users),
  findUserById: (id: number) => query(() => users.find((user) => user.id === id) ?? null),
  findOrdersByUserId: (userId: number) => query(() => orders.filter((order) => order.userId === userId)),
};
