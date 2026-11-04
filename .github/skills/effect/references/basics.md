# Basics

How to structure everyday Effect code: sequencing with `Effect.gen`, naming functions with `Effect.fn`, instrumentation with `pipe`, retry, timeout, concurrency, and running effects.

## Effect.gen

`Effect.gen` and `yield*` are to `Effect` what `async` and `await` are to `Promise`: sequential, readable code without nested callbacks.

```ts
import { Effect } from "effect"

declare const fetchData: Effect.Effect<string>
declare const processData: (data: string) => Effect.Effect<string>

const program = Effect.gen(function* () {
  const data = yield* fetchData
  yield* Effect.logInfo(`Processing data: ${data}`)
  return yield* processData(data)
})
```

The type of `program` collects the success value, every possible error and every required service: `Effect<string, never, never>` here.

## Effect.fn

Use `Effect.fn("name")` for every named, effectful function. Each call gets a tracing span named after the function, and stack traces point to the **call site**, not only the definition.

```ts
import { Effect } from "effect"

interface User {
  readonly id: string
  readonly name: string
}
declare const getUser: (userId: string) => Effect.Effect<User>
declare const processData: (user: User) => Effect.Effect<User>

const processUser = Effect.fn("processUser")(function* (userId: string) {
  yield* Effect.logInfo(`Processing user ${userId}`)
  const user = yield* getUser(userId)
  return yield* processData(user)
})
```

The second argument transforms the whole effect returned by the function: handy for cross-cutting concerns such as a retry or a timeout, without touching the body.

```ts
import { Effect, flow, Schedule } from "effect"

declare const fetchData: (url: string) => Effect.Effect<string>
declare const processData: (data: string) => Effect.Effect<string>

const fetchAndProcess = Effect.fn("fetchAndProcess")(
  function* (url: string) {
    const data = yield* fetchData(url)
    return yield* processData(data)
  },
  flow(
    Effect.retry(Schedule.recurs(3)),
    Effect.timeout("5 seconds"),
  ),
)
```

Name service methods `"Service.method"` (for example `"Users.findById"`).

## Pipe for instrumentation

Add cross-cutting concerns with `.pipe()`:

```ts
import { Effect, Schedule } from "effect"

declare const fetchData: Effect.Effect<string>

const program = fetchData.pipe(
  Effect.timeout("5 seconds"),
  Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.upTo({ times: 3 }))),
  Effect.tap((data) => Effect.logInfo(`Fetched: ${data}`)),
  Effect.withSpan("fetchData"),
)
```

- `Effect.timeout`: fail with a `TimeoutError` if the effect takes too long (and interrupt it).
- `Effect.retry`: retry on failure, following a schedule.
- `Effect.tap`: run a side effect without changing the value.
- `Effect.withSpan`: add a tracing span.

## Retry and timeout

For calls to anything outside the process, combine a timeout per attempt, a retry policy and an overall timeout:

```ts
import { Effect, Schedule } from "effect"

declare const callExternalApi: Effect.Effect<string>

// Exponential backoff (100 ms, 200 ms, 400 ms), at most 3 retries
const retryPolicy = Schedule.exponential("100 millis").pipe(Schedule.upTo({ times: 3 }))

const resilientCall = callExternalApi.pipe(
  Effect.timeout("2 seconds"), // each attempt
  Effect.retry(retryPolicy),
  Effect.timeout("10 seconds"), // all attempts together
)
```

`Effect.retry` also takes options. Use `while` (or `until`) to retry **only** the errors that are worth retrying:

```ts
import { Effect, Schedule, Schema } from "effect"

class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", { message: Schema.String }) {}
class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", { id: Schema.Number }) {}

declare const findUser: (id: number) => Effect.Effect<string, DatabaseError | UserNotFound>

// A missing user will not appear by asking again: only the database errors are retried.
const program = findUser(42).pipe(
  Effect.retry({
    schedule: Schedule.exponential("100 millis"),
    times: 3,
    while: (error) => error._tag === "DatabaseError",
  }),
)
```

Useful schedules:

- `Schedule.exponential("100 millis")`: exponential backoff.
- `Schedule.spaced("1 second")`: fixed delay between attempts.
- `Schedule.recurs(3)`: at most 3 recurrences.
- `schedule.pipe(Schedule.upTo({ times: 3 }))`: limit any schedule to 3 recurrences (or `{ duration: "10 seconds" }`).
- `schedule.pipe(Schedule.jittered)`: randomize the delays.

## Concurrency

`Effect.all` runs effects **sequentially by default**. Pass a `concurrency` option to run them in parallel. If one fails, the others are interrupted (unlike `Promise.all`, which lets them run).

```ts
import { Effect } from "effect"

interface User {
  readonly id: number
  readonly name: string
}
interface Order {
  readonly id: number
  readonly total: number
}
declare const getUser: (id: number) => Effect.Effect<User>
declare const getOrders: (userId: number) => Effect.Effect<ReadonlyArray<Order>>

const getUserWithOrders = Effect.fn("getUserWithOrders")(function* (id: number) {
  const [user, orders] = yield* Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" })
  return { ...user, orders }
})

// N users, 5 at a time
const getUsersWithOrders = (ids: ReadonlyArray<number>) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })
```

## Running effects

An `Effect` is a description: nothing runs until you run it, once, at the edge of the program.

```ts
import { Effect } from "effect"

declare const program: Effect.Effect<string>

const value: Promise<string> = Effect.runPromise(program)
const exit = Effect.runPromiseExit(program) // never rejects: inspect success, failure or defect
```

- `Effect.runPromise` rejects if the effect fails; `Effect.runSync` throws, and only works for synchronous effects.
- Provide every service first (`Effect.provide(layer)`): the type of an effect you run must have `R = never`.
- When the same layers serve many requests (a server, a Next.js route handler), build them once with `ManagedRuntime.make(appLayer)` at module scope and call `runtime.runPromise(effect)` in each handler.
