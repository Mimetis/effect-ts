# Config

`Config` describes typed configuration values: which key to read, how to decode and validate it, defaults and fallbacks. A `Config` is also an `Effect`: `yield*` it in `Effect.gen`.

## Reading values

By default, config is read from environment variables:

```ts
import { Config, Effect, Redacted } from "effect"

const program = Effect.gen(function* () {
  const apiKey = yield* Config.Redacted("API_KEY") // process.env.API_KEY, hidden in logs
  const port = yield* Config.Port("PORT") // an integer between 1 and 65535
  yield* Effect.log(`Starting on port ${port}`)
  return Redacted.value(apiKey) // only where the secret is really needed
})
// Effect<string, Config.ConfigError>
```

A missing or invalid value fails with a `ConfigError`, which says which key and why.

## Constructors

```ts
import { Config, Schema } from "effect"

Config.String("HOST")
Config.NonEmptyString("NAME")
Config.Number("RATIO")
Config.Int("MAX_RETRIES")
Config.Port("PORT")
Config.Boolean("DEBUG")
Config.Redacted("API_KEY") // secrets: Redacted<string>
Config.URL("API_URL") // a URL object
Config.Duration("TIMEOUT") // "5 seconds", "100 millis"…
Config.Literals(["development", "staging", "production"], "NODE_ENV")

// Comma-separated values: env vars are strings, split them yourself
Config.String("TAGS").pipe(Config.map((value) => value.split(",").map((tag) => tag.trim())))

// Any schema, for custom validation
Config.schema(Schema.NumberFromString.pipe(Schema.check(Schema.isBetween({ minimum: 1, maximum: 10 }))), "WORKERS")
```

## Defaults and optional values

```ts
import { Config, Effect } from "effect"

const program = Effect.gen(function* () {
  const port = yield* Config.Port("PORT").pipe(Config.withDefault(3000))
  const host = yield* Config.String("HOST").pipe(Config.orElse(() => Config.String("HOSTNAME")))
  const token = yield* Config.option(Config.Redacted("OPTIONAL_TOKEN")) // Option<Redacted<string>>
  return { port, host, token }
})
```

- `Config.withDefault(value)`: when the key is missing.
- `Config.orElse(() => other)`: try another config when this one fails.
- `Config.option(config)`: an `Option` instead of a failure.

## Validation with Schema

Prefer `Config.schema` for validation: you get the type, the error messages, and the same schemas (brands included) as the rest of the code.

```ts
import { Config, Effect, Schema } from "effect"

const Port = Schema.NumberFromString.pipe(
  Schema.check(Schema.isInt()),
  Schema.check(Schema.isBetween({ minimum: 1, maximum: 65535 })),
  Schema.brand("Port"),
)

const program = Effect.gen(function* () {
  const port = yield* Config.schema(Port, "PORT") // branded as Port
  const env = yield* Config.schema(Schema.Literals(["development", "production"]), "NODE_ENV")
  return { port, env }
})
```

## Grouping values

```ts
import { Config, Effect } from "effect"

const database = Config.all({
  host: Config.String("HOST"),
  port: Config.Port("PORT"),
}).pipe(Config.nested("DATABASE"))

const program = Effect.gen(function* () {
  const { host, port } = yield* database
  return `${host}:${port}`
})
```

With environment variables, `Config.nested("DATABASE")` reads `DATABASE_HOST` and `DATABASE_PORT`.

## Recommended pattern: a config service

Read the config in **one** layer, and let the rest of the code depend on a typed service, not on `Config`:

```ts
import { Config, Context, Effect, Layer, Redacted } from "effect"

class ApiConfig extends Context.Service<
  ApiConfig,
  {
    readonly apiKey: Redacted.Redacted
    readonly baseUrl: string
    readonly timeoutMs: number
  }
>()("@app/ApiConfig") {
  static readonly layer = Layer.effect(
    ApiConfig,
    Effect.gen(function* () {
      const apiKey = yield* Config.Redacted("API_KEY")
      const baseUrl = yield* Config.String("API_BASE_URL").pipe(Config.withDefault("https://api.example.com"))
      const timeoutMs = yield* Config.Int("API_TIMEOUT_MS").pipe(Config.withDefault(30_000))
      return { apiKey, baseUrl, timeoutMs }
    }),
  )

  static readonly testLayer = Layer.succeed(ApiConfig, {
    apiKey: Redacted.make("test-key"),
    baseUrl: "https://test.example.com",
    timeoutMs: 5_000,
  })
}
```

- Loading is separated from business logic.
- A config error happens once, when the layer is built (at startup).
- Tests use `ApiConfig.testLayer`, or an inline `Layer.succeed(ApiConfig, { … })` with different values: no environment variables to fake.

## Config providers

To read from somewhere else than the environment, provide a `ConfigProvider`:

```ts
import { Config, ConfigProvider, Effect } from "effect"

const program = Effect.gen(function* () {
  return yield* Config.Port("PORT")
})

// Values from an object (tests, JSON files…)
const fromObject = ConfigProvider.layer(ConfigProvider.fromUnknown({ PORT: "3000" }))

// Environment variables with a prefix: reads APP_PORT
const prefixed = ConfigProvider.layer(ConfigProvider.fromEnv().pipe(ConfigProvider.nested("APP")))

Effect.runPromise(program.pipe(Effect.provide(fromObject)))
```

## Secrets: Redacted

Always read secrets (tokens, passwords, API keys) with `Config.Redacted`. A `Redacted` value prints as `<redacted>` in logs and errors; get the real value with `Redacted.value(secret)`, only where it is needed.

## Best practices

1. **Validate** critical values (`Config.Port`, `Config.schema`).
2. **Default** only the non-critical settings.
3. **Redact** every secret.
4. **Group** related values (`Config.all` + `Config.nested`).
5. **Load config in a layer**, as a service with a `layer` and a `testLayer`.
