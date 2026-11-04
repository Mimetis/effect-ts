import { z } from "zod";

// The schemas are the source of truth: the types are inferred from them.
export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.email(),
});

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  product: z.string().min(1),
  total: z.number().nonnegative(),
});

export type User = z.infer<typeof UserSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type UserWithOrders = User & { orders: Order[] };
