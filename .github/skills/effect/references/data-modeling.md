# Data modeling with Schema

`Schema` (from `effect`, no separate package in v4) describes data once and gives you the TypeScript type, runtime validation (decoding), serialization (encoding) and precise errors.

- **One source of truth**: the type is derived from the schema (`typeof S.Type`).
- **Parse at the boundaries**: HTTP bodies, database rows, files, env vars. Bad data fails early, with the path of the faulty field.
- **Rich domain types**: brands keep different ids apart; classes add methods.

All data is made of **records** ("a user has a name AND an email") and **variants** ("a result is a success OR a failure").

## Records

`Schema.Struct` for plain objects, `Schema.Class` when you want a class with methods:

```ts
import { Schema } from "effect"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type

const Address = Schema.Struct({
  city: Schema.String,
  zip: Schema.String,
})
type Address = typeof Address.Type

class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  email: Schema.String,
  address: Address,
  createdAt: Schema.Date,
}) {
  get displayName() {
    return `${this.name} (${this.email})`
  }
}

const user = new User({
  id: UserId.make("user-123"),
  name: "Alice",
  email: "alice@example.com",
  address: { city: "Toulouse", zip: "31000" },
  createdAt: new Date(),
})

console.log(user.displayName) // "Alice (alice@example.com)"
```

The constructor validates its input: `new User({ … })` throws if a field is invalid.

## Variants

Simple alternatives: `Schema.Literals`.

```ts
import { Schema } from "effect"

const Status = Schema.Literals(["pending", "active", "completed"])
type Status = typeof Status.Type // "pending" | "active" | "completed"
```

Variants with data: `Schema.TaggedClass` for each case, `Schema.Union` for the whole, `Match` for exhaustive handling.

```ts
import { Match, Schema } from "effect"

class Success extends Schema.TaggedClass<Success>()("Success", {
  value: Schema.Number,
}) {}

class Failure extends Schema.TaggedClass<Failure>()("Failure", {
  error: Schema.String,
}) {}

const Result = Schema.Union([Success, Failure])
type Result = typeof Result.Type

const render = (result: Result) =>
  Match.value(result).pipe(
    Match.tag("Success", ({ value }) => `Got: ${value}`),
    Match.tag("Failure", ({ error }) => `Error: ${error}`),
    Match.exhaustive, // a compile error if a case is missing
  )

render(new Success({ value: 42 })) // "Got: 42"
```

## Branded types

A brand prevents mixing values that share the same underlying type. In a good domain model, most primitives are branded: ids, but also emails, URLs, slugs, amounts, ports…

```ts
import { Schema } from "effect"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type

const PostId = Schema.String.pipe(Schema.brand("PostId"))
type PostId = typeof PostId.Type

const Port = Schema.Int.pipe(
  Schema.check(Schema.isBetween({ minimum: 1, maximum: 65535 })),
  Schema.brand("Port"),
)
type Port = typeof Port.Type

const getUser = (id: UserId) => id

getUser(UserId.make("user-123")) // ✅
// getUser(PostId.make("post-456")) // ❌ PostId is not a UserId
// getUser("user-123") // ❌ a raw string is not a UserId
```

`UserId.make(value)` validates and brands a value.

## Checks (refinements)

Add constraints with `Schema.check(…)`:

```ts
import { Schema } from "effect"

const Order = Schema.Struct({
  id: Schema.Int.pipe(Schema.check(Schema.isGreaterThan(0))),
  product: Schema.NonEmptyString,
  quantity: Schema.Int.pipe(Schema.check(Schema.isBetween({ minimum: 1, maximum: 99 }))),
  total: Schema.Finite.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(0))),
  email: Schema.String.pipe(Schema.check(Schema.isPattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))),
})
```

Common checks: `Schema.isGreaterThan`, `Schema.isGreaterThanOrEqualTo`, `Schema.isBetween`, `Schema.isInt`, `Schema.isMinLength`, `Schema.isNonEmpty`, `Schema.isPattern`. Ready-made schemas: `Schema.Int`, `Schema.Finite`, `Schema.NonEmptyString`, `Schema.Trimmed`.

## Decoding unknown data

Anything that comes from outside your code is `unknown` until decoded. `Schema.decodeUnknownEffect` returns an `Effect` whose error is a `Schema.SchemaError`, tracked in the type like any other error:

```ts
import { Effect, Schema } from "effect"

const User = Schema.Struct({
  id: Schema.Int,
  name: Schema.NonEmptyString,
})

declare const row: unknown // a database row, a JSON body…

const program = Effect.gen(function* () {
  const user = yield* Schema.decodeUnknownEffect(User)(row)
  return user.name
})
// Effect<string, Schema.SchemaError>
```

- `Schema.decodeUnknownEffect(S)`: an `Effect` (use this inside Effect code).
- `Schema.decodeUnknownSync(S)`: throws (only at the edge, outside Effect code).
- `Schema.decodeUnknownExit(S)`: an `Exit`, never throws.
- Arrays: `Schema.Array(User)`; optional field: `Schema.optional(Schema.String)`; nullable: `Schema.NullOr(Schema.String)`.

## JSON encoding and decoding

`Schema.fromJsonString(S)` combines `JSON.parse` + decoding (and `JSON.stringify` + encoding the other way):

```ts
import { Effect, Schema } from "effect"

class Position extends Schema.Class<Position>("Position")({
  row: Schema.Literals(["A", "B", "C", "D", "E", "F", "G", "H"]),
  column: Schema.Literals(["1", "2", "3", "4", "5", "6", "7", "8"]),
}) {}

class Move extends Schema.Class<Move>("Move")({
  from: Position,
  to: Position,
}) {}

const MoveFromJson = Schema.fromJsonString(Move)

const program = Effect.gen(function* () {
  const move = yield* Schema.decodeUnknownEffect(MoveFromJson)(
    '{"from":{"row":"A","column":"1"},"to":{"row":"B","column":"2"}}',
  )
  const json = yield* Schema.encodeEffect(MoveFromJson)(move) // a string
  return json
})
```

## From zod

| zod | Schema |
|---|---|
| `z.object({ … })` | `Schema.Struct({ … })` (or `Schema.Class`) |
| `z.string()`, `z.number()`, `z.boolean()` | `Schema.String`, `Schema.Number` (or `Schema.Finite`), `Schema.Boolean` |
| `z.string().min(1)` | `Schema.NonEmptyString` |
| `z.number().int().positive()` | `Schema.Int.pipe(Schema.check(Schema.isGreaterThan(0)))` |
| `z.number().nonnegative()` | `Schema.Finite.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(0)))` |
| `z.email()` | `Schema.String.pipe(Schema.check(Schema.isPattern(/…/)))` |
| `z.enum(["a", "b"])` | `Schema.Literals(["a", "b"])` |
| `z.array(S)` | `Schema.Array(S)` |
| `z.infer<typeof S>` | `typeof S.Type` |
| `S.parse(data)` (throws a `ZodError`) | `Schema.decodeUnknownEffect(S)(data)` (`SchemaError` in `E`) |
| `S.safeParse(data)` | `Schema.decodeUnknownExit(S)(data)` |
