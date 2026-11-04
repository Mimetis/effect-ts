import { Schema } from "effect";

// The schemas are the source of truth: the types are derived from them (like z.infer with zod).
const PositiveInt = Schema.Int.pipe(Schema.check(Schema.isGreaterThan(0)));

export const User = Schema.Struct({
  id: PositiveInt,
  name: Schema.NonEmptyString,
  email: Schema.String.pipe(Schema.check(Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))),
});
export type User = typeof User.Type;

export const Order = Schema.Struct({
  id: PositiveInt,
  userId: PositiveInt,
  product: Schema.NonEmptyString,
  total: Schema.Finite.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(0))),
});
export type Order = typeof Order.Type;

export type UserWithOrders = User & { readonly orders: ReadonlyArray<Order> };
