# Testing with @effect/vitest

`@effect/vitest` runs Effect programs as Vitest tests: `it.effect` runs the effect, closes its scope at the end, provides the test services (`TestClock`…), and reports failures with their full cause.

## Install

Use the same version as `effect`:

```bash
pnpm add -D vitest @effect/vitest@4.0.0
```

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## Basic tests

Import `describe`, `expect` and `it` from `@effect/vitest`:

```ts
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

describe("Calculator", () => {
  it("adds synchronously", () => {
    expect(1 + 1).toBe(2)
  })

  it.effect("adds in an Effect", () =>
    Effect.gen(function* () {
      const result = yield* Effect.succeed(1 + 1)
      expect(result).toBe(2)
    }),
  )
})
```

A test fails if the effect fails: no need to unwrap anything.

## Testing failures

Turn the error into a value with `Effect.flip` (or inspect everything with `Effect.exit`):

```ts
import { expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"

class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", { id: Schema.Number }) {}

const findUser = (id: number) =>
  id === 1 ? Effect.succeed({ id, name: "Ada" }) : Effect.fail(new UserNotFound({ id }))

it.effect("fails with UserNotFound", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(findUser(42))
    expect(error._tag).toBe("UserNotFound")
    expect(error.id).toBe(42)
  }),
)
```

## Time: TestClock and it.live

`it.effect` uses a `TestClock` that starts at 0 and only moves when you tell it. Fork the effect, move the clock, join:

```ts
import { expect, it } from "@effect/vitest"
import { Effect, Fiber } from "effect"
import { TestClock } from "effect/testing"

it.effect("resolves after 10 seconds, instantly", () =>
  Effect.gen(function* () {
    const fiber = yield* Effect.delay(Effect.succeed("done"), "10 seconds").pipe(Effect.forkChild)
    yield* TestClock.adjust("10 seconds")
    expect(yield* Fiber.join(fiber)).toBe("done")
  }),
)
```

This is how you test a retry policy or a timeout without waiting: a 7-second backoff runs in a few milliseconds.

`it.live` uses the real clock (and shows the logs), for the rare tests that need real time:

```ts
import { expect, it } from "@effect/vitest"
import { Clock, Effect } from "effect"

it.live("uses the real clock", () =>
  Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis
    expect(now).toBeGreaterThan(0)
  }),
)
```

## Providing layers

Provide a test layer **inside each test**: every test gets fresh state.

```ts
import { expect, it } from "@effect/vitest"
import { Context, Effect, Layer } from "effect"

class Counter extends Context.Service<
  Counter,
  { readonly get: () => Effect.Effect<number>; readonly increment: () => Effect.Effect<void> }
>()("@app/Counter") {
  static readonly testLayer = Layer.sync(Counter, () => {
    let count = 0
    return {
      get: () => Effect.sync(() => count),
      increment: () => Effect.sync(() => void count++),
    }
  })
}

it.effect("starts at zero", () =>
  Effect.gen(function* () {
    const counter = yield* Counter
    expect(yield* counter.get()).toBe(0)
  }).pipe(Effect.provide(Counter.testLayer)),
)

it.effect("increments, without leaking into other tests", () =>
  Effect.gen(function* () {
    const counter = yield* Counter
    yield* counter.increment()
    expect(yield* counter.get()).toBe(1)
  }).pipe(Effect.provide(Counter.testLayer)),
)
```

To test a service with its dependencies, compose the real layer with test layers. `Layer.provideMerge` keeps the leaf services reachable, for setup and assertions:

```ts
import { describe, expect, it } from "@effect/vitest"
import { Context, Effect, Layer } from "effect"

class Emails extends Context.Service<
  Emails,
  { readonly send: (to: string) => Effect.Effect<void>; readonly sent: Effect.Effect<ReadonlyArray<string>> }
>()("@app/Emails") {
  static readonly testLayer = Layer.sync(Emails, () => {
    const sent: Array<string> = []
    return {
      send: (to: string) => Effect.sync(() => void sent.push(to)),
      sent: Effect.sync(() => sent),
    }
  })
}

class Signup extends Context.Service<Signup, { readonly register: (email: string) => Effect.Effect<void> }>()(
  "@app/Signup",
) {
  static readonly layer = Layer.effect(
    Signup,
    Effect.gen(function* () {
      const emails = yield* Emails
      const register = Effect.fn("Signup.register")(function* (email: string) {
        yield* emails.send(email)
      })
      return { register }
    }),
  )
}

const testLayer = Signup.layer.pipe(Layer.provideMerge(Emails.testLayer))

describe("Signup", () => {
  it.effect("sends a welcome email", () =>
    Effect.gen(function* () {
      const signup = yield* Signup
      const emails = yield* Emails

      yield* signup.register("ada@example.com")

      expect(yield* emails.sent).toEqual(["ada@example.com"])
    }).pipe(Effect.provide(testLayer)),
  )
})
```

## Sharing a layer across a suite

`it.layer(layer)` builds the layer **once** for all the tests of the block, and releases it at the end. Use it only for expensive resources (a database connection): the state is shared between tests.

```ts
import { expect, it } from "@effect/vitest"
import { Context, Effect, Layer } from "effect"

class Counter extends Context.Service<
  Counter,
  { readonly get: () => Effect.Effect<number>; readonly increment: () => Effect.Effect<void> }
>()("@app/Counter") {
  static readonly layer = Layer.sync(Counter, () => {
    let count = 0
    return {
      get: () => Effect.sync(() => count),
      increment: () => Effect.sync(() => void count++),
    }
  })
}

it.layer(Counter.layer)("shared counter", (it) => {
  it.effect("increments", () =>
    Effect.gen(function* () {
      const counter = yield* Counter
      yield* counter.increment()
      expect(yield* counter.get()).toBe(1)
    }),
  )

  it.effect("sees the previous test", () =>
    Effect.gen(function* () {
      const counter = yield* Counter
      expect(yield* counter.get()).toBe(1) // shared state
    }),
  )
})
```

## Logs

`it.effect` hides the logs, even with a logger provided. Use `it.live` when you need to see them:

```ts
import { it } from "@effect/vitest"
import { Effect } from "effect"

it.live("with logs", () => Effect.log("This is shown"))
```

Vitest 5 also hides the console output of passing tests: run `vitest run --silent=false` to see it.

## Modifiers

- `it.effect.skip(…)`: skip a test.
- `it.effect.only(…)`: run only this test.
- `it.effect.fails(…)`: a test that is expected to fail (a known bug).

## Running

```bash
pnpm vitest run                 # all tests
pnpm vitest                     # watch mode
pnpm vitest run tests/users.test.ts
pnpm vitest run -t "Signup"     # tests whose name matches
```
