# Error handling

Effect tracks the expected errors in the type (`Effect<A, E, R>`): callers see what can go wrong, and the compiler checks that they handled it.

## Defining errors: Schema.TaggedError

One class per expected failure, each with a `_tag`:

```ts
import { Schema } from "effect"

class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", {
  field: Schema.String,
  message: Schema.String,
}) {}

class NotFoundError extends Schema.TaggedError<NotFoundError>()("NotFoundError", {
  resource: Schema.String,
  id: Schema.String,
}) {}

const AppError = Schema.Union([ValidationError, NotFoundError])
type AppError = typeof AppError.Type

const error = new ValidationError({ field: "email", message: "Invalid format" })
```

- `_tag` for pattern matching (`catchTag`, `catchTags`, `Match.tag`).
- Serializable: they can cross the network or be stored.
- A default `message` when you don't declare one.

They are **yieldable**: no need for `Effect.fail`.

```ts
import { Effect, Random, Schema } from "effect"

class BadLuck extends Schema.TaggedError<BadLuck>()("BadLuck", { roll: Schema.Number }) {}

const rollDie = Effect.gen(function* () {
  const roll = yield* Random.nextIntBetween(1, 6)
  if (roll === 1) return yield* new BadLuck({ roll })
  return roll
})
// Effect<number, BadLuck>
```

Write `return yield* new MyError(…)` so TypeScript knows the rest of the block does not run.

`Data.TaggedError("Tag")<{ … }>` also exists: lighter (no schema, not serializable), fine for purely internal errors.

## Recovering

### catchTag: one error

```ts
import { Effect, Schema } from "effect"

class HttpError extends Schema.TaggedError<HttpError>()("HttpError", { status: Schema.Number }) {}
class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", { message: Schema.String }) {}

declare const program: Effect.Effect<string, HttpError | ValidationError>

const recovered: Effect.Effect<string, ValidationError> = program.pipe(
  Effect.catchTag("HttpError", (error) =>
    Effect.gen(function* () {
      yield* Effect.logWarning(`HTTP ${error.status}`)
      return "fallback"
    }),
  ),
)
```

The handled error disappears from the type.

### catchTags: several errors at once

```ts
import { Effect, Schema } from "effect"

class HttpError extends Schema.TaggedError<HttpError>()("HttpError", { status: Schema.Number }) {}
class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", { message: Schema.String }) {}

declare const program: Effect.Effect<string, HttpError | ValidationError>

const recovered: Effect.Effect<string> = program.pipe(
  Effect.catchTags({
    HttpError: () => Effect.succeed("recovered from HttpError"),
    ValidationError: () => Effect.succeed("recovered from ValidationError"),
  }),
)
```

### catch: every error

```ts
import { Effect, Schema } from "effect"

class HttpError extends Schema.TaggedError<HttpError>()("HttpError", { status: Schema.Number }) {}
class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", { message: Schema.String }) {}

declare const program: Effect.Effect<string, HttpError | ValidationError>

const recovered: Effect.Effect<string> = program.pipe(
  Effect.catch((error) =>
    Effect.gen(function* () {
      yield* Effect.logError("Error occurred", error)
      return `Recovered from ${error._tag}`
    }),
  ),
)
```

Other tools: `Effect.mapError` (translate an error into another), `Effect.orElseSucceed` (a fallback value), `Effect.result` (get a `Result` instead of failing).

## Expected errors vs defects

Typing an error only helps if the caller can do something about it.

- **Typed errors** for domain failures the caller can handle: validation, not found, permission denied, rate limit, temporary unavailability.
- **Defects** for what cannot be recovered: bugs, broken invariants, a missing config at startup. A defect stops the fiber and is handled once, at the boundary (logs, crash report, a 500).

```ts
import { Effect } from "effect"

declare const loadConfig: Effect.Effect<{ readonly port: number }, Error>

const main = Effect.gen(function* () {
  // Nothing can work without the config: turn the error into a defect
  const config = yield* loadConfig.pipe(Effect.orDie)
  yield* Effect.log(`Starting on port ${config.port}`)
})
```

Catch defects almost never: only at the boundary, with `Effect.catchDefect` (or inspect everything with `Effect.exit`).

## Wrapping errors from libraries

`Effect.tryPromise` turns a promise into an `Effect`, and its `catch` turns whatever was thrown into one of your errors. Keep the original error in a `Schema.Defect()` field:

```ts
import { Effect, Schema } from "effect"

class ApiError extends Schema.TaggedError<ApiError>()("ApiError", {
  endpoint: Schema.String,
  cause: Schema.Defect(), // the original error, from fetch, a driver, a SDK…
}) {}

const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`https://api.example.com/users/${id}`).then((res) => res.json() as Promise<unknown>),
    catch: (cause) => new ApiError({ endpoint: `/users/${id}`, cause }),
  })
// Effect<unknown, ApiError>
```

Then decode the `unknown` result with `Schema.decodeUnknownEffect` (see [data modeling](./data-modeling.md)). For synchronous code that may throw, use `Effect.try({ try, catch })`.

## Mapping errors to HTTP responses

At the boundary (a route handler), each endpoint maps **its own** errors to status codes with `Effect.catchTags`. Once every tag is handled, `E` is `never`.

```ts
import { Effect, Schema } from "effect"

class InvalidUserId extends Schema.TaggedError<InvalidUserId>()("InvalidUserId", { raw: Schema.String }) {}
class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", { id: Schema.Number }) {}
class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", { cause: Schema.Defect() }) {}

declare const getUser: (raw: string) => Effect.Effect<{ readonly id: number }, InvalidUserId | UserNotFound | DatabaseError | Schema.SchemaError>

const handler = (raw: string): Effect.Effect<Response> =>
  getUser(raw).pipe(
    Effect.map((user) => Response.json(user)),
    Effect.catchTags({
      InvalidUserId: (e) => Effect.succeed(Response.json({ error: e._tag, raw: e.raw }, { status: 400 })),
      UserNotFound: (e) => Effect.succeed(Response.json({ error: e._tag, id: e.id }, { status: 404 })),
      DatabaseError: () => Effect.succeed(Response.json({ error: "DatabaseError" }, { status: 503 })),
      SchemaError: () => Effect.succeed(Response.json({ error: "ValidationError" }, { status: 500 })),
    }),
  )
```

If you forget a tag, `E` is not `never` and the compiler shows which error is still unhandled: no more `catch (e: unknown)` with a chain of `instanceof`.
