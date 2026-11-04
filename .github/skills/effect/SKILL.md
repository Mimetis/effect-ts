---
name: effect
description: "Use when writing, reviewing, debugging or migrating TypeScript code to Effect v4 (the `effect` package, 4.x): Effect.gen and Effect.fn, typed errors (Schema.TaggedError, catchTag, catchTags, defects), services and layers (Context.Service, Layer, ManagedRuntime), Schema data modeling and validation, Config, retry and timeout with Schedule, concurrency with Effect.all and Effect.forEach, HTTP clients (effect/http), and tests with @effect/vitest. Also use to migrate async/await, try/catch, Promise.all, zod or hand-written retry code to Effect."
---

# Effect v4

This repository uses **`effect` 4.0.0**: one package, no `@effect/schema`, no `@effect/platform` for HTTP clients.

Most blog posts, older docs and model training data describe Effect 3 or v4 betas. **Check every API against the installed version**: `node_modules/effect/dist/<Module>.d.ts` contains the signatures, the docs and runnable examples. When in doubt, grep for `export declare const <name>` there.

## v4 pitfalls

| Don't write (Effect 3 / v4 beta) | Write (effect 4.0.0) |
|---|---|
| `Context.Tag`, `Context.GenericTag`, `Effect.Service` | `class X extends Context.Service<X, Shape>()("@app/X") {}` |
| `Effect.catchAll`, `Effect.catchAllDefect`, `Effect.catchAllCause` | `Effect.catch`, `Effect.catchDefect`, `Effect.catchCause` |
| `Effect.either`, the `Either` module | `Effect.result`, the `Result` module |
| `Effect.fork` | `Effect.forkChild` |
| `Schema.TaggedErrorClass<E>()(…)` | `Schema.TaggedError<E>()("Tag", { … })` |
| `Schema.TaggedClass<T>("Id")("Tag", …)` | `Schema.TaggedClass<T>()("Tag", { … })` |
| `Schema.Union(A, B)`, `Schema.Literal("a", "b")` | `Schema.Union([A, B])`, `Schema.Literals(["a", "b"])` |
| `Schema.decodeUnknown(S)` | `Schema.decodeUnknownEffect(S)` (or `…Sync`, `…Exit`) |
| a field typed `Schema.Defect` | `Schema.Defect()` (it is a function) |
| `Schedule.both(Schedule.recurs(n))` | `Schedule.upTo({ times: n })`, or `Effect.retry({ schedule, times: n })` |
| `Config.string`, `Config.int`, `Config.redacted`, `Config.mapOrFail` | `Config.String`, `Config.Int`, `Config.Redacted`, `Config.Port`, `Config.URL`, `Config.schema(…)` |
| `effect/unstable/http`, `@effect/platform` HTTP client | `import { HttpClient, … } from "effect/http"` |
| `Effect.catchTag("ResponseError", …)` on HTTP errors | `Effect.catchTag("HttpClientError", (e) => … e.reason._tag …)` |

## Core rules

1. **Sequence with `Effect.gen`** and `yield*`, like `async` / `await`.
2. **Name every effectful function with `Effect.fn("Module.name")`**: you get a tracing span and call-site stack traces. Use it for service methods too, even without arguments.
3. **Add cross-cutting concerns with `.pipe()`**: `Effect.timeout`, `Effect.retry`, `Effect.tap`, `Effect.withSpan`.
4. **One `Schema.TaggedError` per expected failure.** Yield it directly (`return yield* new NotFound({ id })`), recover with `Effect.catchTag` / `Effect.catchTags`. Unrecoverable problems are **defects** (`Effect.orDie`), handled once at the boundary.
5. **Wrap promises from libraries with `Effect.tryPromise({ try, catch })`** and keep the original error in a `cause: Schema.Defect()` field.
6. **Dependencies are services**: `Context.Service` with an `@app/Name` key, readonly methods that return `Effect` with `R = never`, the implementation in `static readonly layer = Layer.effect(…)`, a `testLayer` for tests.
7. **Compose layers once and provide them once**, at the entry point. Store a parameterized layer in a constant before reusing it, so it is built only once.
8. **Model and validate data with `Schema`**: brand primitives, `Schema.Class` for records, `Schema.TaggedClass` + `Schema.Union` + `Match` for variants, `Schema.decodeUnknownEffect` for anything coming from outside (the `SchemaError` lands in `E`).
9. **Read configuration through a config service** built from `Config`; secrets with `Config.Redacted`; validation with `Config.schema`.
10. **Resilience**: a timeout per attempt, a retry policy (`Schedule.exponential` + `Schedule.upTo`), then an overall timeout.
11. **Test with `@effect/vitest`**: `it.effect`, `TestClock` for time, a layer provided per test.

## Migrating async / await code

| async / await | Effect |
|---|---|
| `async function f(id): Promise<A>` | `const f = Effect.fn("f")(function* (id) { … })`, which returns `Effect<A, E, R>` |
| `await x` | `yield* x` |
| `class NotFound extends Error` + `throw` | `class NotFound extends Schema.TaggedError<NotFound>()("NotFound", { … }) {}` + `return yield* new NotFound(…)` |
| `try { … } catch (e) { if (e instanceof …) }` | `Effect.catchTags({ NotFound: …, DbError: … })`, typed and checked by the compiler |
| hand-written `retry(fn, { retries: 3, delayMs: 100 })` | `Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 })` |
| retry only some errors | `Effect.retry({ …, while: (e) => e._tag === "DbError" })` |
| `Promise.all([a, b])` | `Effect.all([a, b], { concurrency: "unbounded" })` (the other fiber is interrupted on failure) |
| N items, 5 at a time | `Effect.forEach(ids, f, { concurrency: 5 })` |
| `AbortSignal` / `AbortSignal.timeout` | nothing to pass around: interruption is built in; `Effect.timeout("2 seconds")` |
| zod `S.parse(data)` | `Schema.decodeUnknownEffect(S)(data)` |
| a module-level client (`db`, `fetch` wrapper) | a `Context.Service` + a `Layer` (and a `testLayer`) |
| a promise from a library | `Effect.tryPromise({ try: () => …, catch: (cause) => new MyError({ cause }) })` |

Migrate from the leaves up: errors and schemas first, then the data access as a service, then the business functions with `Effect.fn`, then the entry point.

## Entry point: a Next.js route handler

Build the layers once with `ManagedRuntime` (module scope), and map **this endpoint's** errors to HTTP responses inside the route, with `Effect.catchTags`. When every tag is handled, `E` is `never`; any remaining failure is a defect and becomes a 500.

```ts
import { Context, Effect, Layer, ManagedRuntime, Schema } from "effect"

class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", { id: Schema.Number }) {}

class Users extends Context.Service<Users, {
  readonly findById: (id: number) => Effect.Effect<{ id: number; name: string }, UserNotFound>
}>()("@app/Users") {
  static readonly layer = Layer.succeed(Users, {
    findById: Effect.fn("Users.findById")(function* (id: number) {
      if (id !== 1) return yield* new UserNotFound({ id })
      return { id, name: "Ada" }
    }),
  })
}

// Module scope: the layers are built once and shared by every request.
const runtime = ManagedRuntime.make(Users.layer)

export async function GET(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"))

  const program = Effect.gen(function* () {
    const users = yield* Users
    const user = yield* users.findById(id)
    return Response.json(user)
  }).pipe(
    Effect.catchTags({
      UserNotFound: (e) => Effect.succeed(Response.json({ error: e._tag, id: e.id }, { status: 404 })),
    }),
  )

  return runtime.runPromise(program)
}
```

In Next.js route handlers, type the second argument with `RouteContext<"/api/users/[id]">` and read `await params`.

## References

Read the matching file before writing code on that topic:

| Topic | File |
|---|---|
| `Effect.gen`, `Effect.fn`, pipe, retry, timeout, concurrency, running effects | [basics](./references/basics.md) |
| `Context.Service`, `Layer`, composition, memoization, test layers | [services and layers](./references/services-and-layers.md) |
| `Schema`: records, variants, brands, JSON, decoding, zod equivalents | [data modeling](./references/data-modeling.md) |
| `Schema.TaggedError`, `catchTag(s)`, defects, wrapping library errors, HTTP mapping | [error handling](./references/error-handling.md) |
| `Config`, `ConfigProvider`, `Redacted`, config services | [config](./references/config.md) |
| `@effect/vitest`, `it.effect`, `TestClock`, test layers | [testing](./references/testing.md) |
| `effect/http` client: requests, decoding, status, errors, retries | [HTTP client](./references/http-client.md) |

## Source

Adapted from the [effect-solutions](https://github.com/kitlangton/effect-solutions) guides by Kit Langton (MIT, see [LICENSE-effect-solutions](./LICENSE-effect-solutions)): basics, services and layers, data modeling, error handling, config, testing, HTTP clients. Rewritten for `effect` 4.0.0; every example has been type-checked against it.
