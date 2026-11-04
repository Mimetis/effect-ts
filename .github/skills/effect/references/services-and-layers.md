# Services and layers

A **service** is a contract (an interface plus a unique key). A **layer** is an implementation of that contract. Code asks for services with `yield*`; the compiler tracks them in the `R` type parameter; the entry point provides the layers once.

## Defining a service

```ts
import { Context, Effect } from "effect"

class Database extends Context.Service<
  Database,
  {
    readonly query: (sql: string) => Effect.Effect<ReadonlyArray<unknown>>
    readonly execute: (sql: string) => Effect.Effect<void>
  }
>()("@app/Database") {}

class Logger extends Context.Service<
  Logger,
  {
    readonly log: (message: string) => Effect.Effect<void>
  }
>()("@app/Logger") {}
```

- **Keys must be unique**: use an `@app/ServiceName` prefix.
- **Methods have no requirements (`R = never`)**: what a service needs is resolved when its layer is built, not in every method signature.
- **Readonly properties only**: a service does not expose mutable state.

## Implementing a service with a layer

A layer sets the service up (connect, read config), acquires the services it depends on, and manages the resource lifecycle (cleanup is automatic).

```ts
import { Context, Effect, Layer, Schema } from "effect"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type

class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
}) {}

class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", { id: UserId }) {}

class Database extends Context.Service<
  Database,
  { readonly findUser: (id: string) => Effect.Effect<unknown> }
>()("@app/Database") {}

class Analytics extends Context.Service<
  Analytics,
  { readonly track: (event: string, data: Record<string, unknown>) => Effect.Effect<void> }
>()("@app/Analytics") {}

class Users extends Context.Service<
  Users,
  { readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound | Schema.SchemaError> }
>()("@app/Users") {
  static readonly layer = Layer.effect(
    Users,
    Effect.gen(function* () {
      // 1. Acquire the services this one depends on
      const db = yield* Database
      const analytics = yield* Analytics

      // 2. Define the methods with Effect.fn, named "Service.method"
      const findById = Effect.fn("Users.findById")(function* (id: UserId) {
        yield* analytics.track("user.find", { id })
        const row = yield* db.findUser(id)
        if (row === null) return yield* new UserNotFound({ id })
        return yield* Schema.decodeUnknownEffect(User)(row)
      })

      // 3. Return the implementation
      return { findById }
    }),
  )
}
```

The type of `Users.layer` is `Layer<Users, never, Database | Analytics>`: it provides `Users` and still requires `Database` and `Analytics`.

**Naming**: camelCase with a `Layer` suffix, as static properties: `layer`, `testLayer`, `postgresLayer`, `inMemoryLayer`.

| Constructor | Use when |
|---|---|
| `Layer.succeed(Tag, impl)` | the implementation is a plain value |
| `Layer.sync(Tag, () => impl)` | building it needs synchronous setup (local state) |
| `Layer.effect(Tag, effect)` | building it needs other services, config or async work |

## Service-driven development

Sketch the leaf services as contracts only, then write the higher-level orchestration against them. It type-checks before any leaf is implemented, and adding the real implementations later does not change it.

```ts
import { Clock, Context, Effect, Layer } from "effect"

class Users extends Context.Service<
  Users,
  { readonly findById: (id: string) => Effect.Effect<{ readonly email: string }> }
>()("@app/Users") {}

class Tickets extends Context.Service<
  Tickets,
  { readonly issue: (eventId: string, userId: string) => Effect.Effect<{ readonly code: string }> }
>()("@app/Tickets") {}

class Emails extends Context.Service<
  Emails,
  { readonly send: (to: string, subject: string, body: string) => Effect.Effect<void> }
>()("@app/Emails") {}

class Events extends Context.Service<
  Events,
  { readonly register: (eventId: string, userId: string) => Effect.Effect<{ readonly registeredAt: Date }> }
>()("@app/Events") {
  static readonly layer = Layer.effect(
    Events,
    Effect.gen(function* () {
      const users = yield* Users
      const tickets = yield* Tickets
      const emails = yield* Emails

      const register = Effect.fn("Events.register")(function* (eventId: string, userId: string) {
        const user = yield* users.findById(userId)
        const ticket = yield* tickets.issue(eventId, userId)
        const now = yield* Clock.currentTimeMillis
        yield* emails.send(user.email, "Registration confirmed", `Your ticket: ${ticket.code}`)
        return { registeredAt: new Date(now) }
      })

      return { register }
    }),
  )
}
```

## Test implementations

Give each service a lightweight `testLayer`. Local mutable state is fine there.

```ts
import { Context, Effect, Layer } from "effect"

class Cache extends Context.Service<
  Cache,
  {
    readonly get: (key: string) => Effect.Effect<string | undefined>
    readonly set: (key: string, value: string) => Effect.Effect<void>
  }
>()("@app/Cache") {
  static readonly testLayer = Layer.sync(Cache, () => {
    const store = new Map<string, string>()
    return {
      get: (key: string) => Effect.sync(() => store.get(key)),
      set: (key: string, value: string) => Effect.sync(() => void store.set(key, value)),
    }
  })
}
```

## Providing layers: once, at the top

Compose every layer into one application layer, and provide it once at the entry point. Do not scatter `Effect.provide` through the code.

```ts
import { Context, Effect, Layer } from "effect"

class Config extends Context.Service<Config, { readonly apiKey: string }>()("@app/Config") {}
class Database extends Context.Service<Database, { readonly ping: () => Effect.Effect<void> }>()("@app/Database") {}
class UserService extends Context.Service<UserService, { readonly getUser: () => Effect.Effect<string> }>()("@app/UserService") {}

declare const configLayer: Layer.Layer<Config>
declare const databaseLayer: Layer.Layer<Database, never, Config>
declare const userServiceLayer: Layer.Layer<UserService, never, Database>

// provideMerge: feed the dependency AND keep it in the output
const appLayer = userServiceLayer.pipe(
  Layer.provideMerge(databaseLayer),
  Layer.provideMerge(configLayer),
)

const program = Effect.gen(function* () {
  const users = yield* UserService
  return yield* users.getUser()
})

const main = program.pipe(Effect.provide(appLayer))
```

- `Layer.provide(dep)`: feeds `dep` to the layer; `dep` is **not** part of the output.
- `Layer.provideMerge(dep)`: feeds `dep` and also exposes it (useful in tests, to reach a leaf service).
- `Layer.mergeAll(a, b, c)`: combines independent layers.

Benefits: the whole dependency graph is in one place, tests swap `appLayer` for a test layer, and the types show what each effect needs.

## Layer memoization

Layers are memoized **by reference**: the same layer object used twice in a graph is built once. Calling a layer constructor twice creates two objects, so two instances (two connection pools…).

```ts
import { Context, Effect, Layer } from "effect"

class SqlClient extends Context.Service<SqlClient, { readonly query: (sql: string) => Effect.Effect<ReadonlyArray<unknown>> }>()("@app/SqlClient") {}
class UserRepo extends Context.Service<UserRepo, { readonly count: () => Effect.Effect<number> }>()("@app/UserRepo") {}
class OrderRepo extends Context.Service<OrderRepo, { readonly count: () => Effect.Effect<number> }>()("@app/OrderRepo") {}

declare const postgresLayer: (options: { readonly url: string; readonly poolSize: number }) => Layer.Layer<SqlClient>
declare const userRepoLayer: Layer.Layer<UserRepo, never, SqlClient>
declare const orderRepoLayer: Layer.Layer<OrderRepo, never, SqlClient>

// ❌ Two calls, two layer objects: two connection pools
const bad = Layer.mergeAll(
  userRepoLayer.pipe(Layer.provide(postgresLayer({ url: "postgres://localhost/db", poolSize: 10 }))),
  orderRepoLayer.pipe(Layer.provide(postgresLayer({ url: "postgres://localhost/db", poolSize: 10 }))),
)

// ✅ Store the layer in a constant: one pool, shared
const sqlLayer = postgresLayer({ url: "postgres://localhost/db", poolSize: 10 })
const good = Layer.mergeAll(
  userRepoLayer.pipe(Layer.provide(sqlLayer)),
  orderRepoLayer.pipe(Layer.provide(sqlLayer)),
)
```

**Rule**: store the result of a parameterized layer constructor in a module-level constant before using it in several places.

## Effect.Service does not exist in v4

Effect 3 had `Effect.Service` (a tag and a default layer in one class) and `Context.Tag`. In `effect` 4.0.0, use `Context.Service` and put the implementations in static layer properties.
