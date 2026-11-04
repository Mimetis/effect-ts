# HTTP client

`effect/http` contains a typed HTTP client that works with `Schema` to validate requests and responses. In v4 it is part of the `effect` package (not `@effect/platform`, not `effect/unstable/http`).

## Minimal example

```ts
import { Effect, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientResponse } from "effect/http"

const Repo = Schema.Struct({
  id: Schema.Number,
  full_name: Schema.String,
  stargazers_count: Schema.Number,
})

const program = Effect.gen(function* () {
  const response = yield* HttpClient.get("https://api.github.com/repos/Effect-TS/effect")
  const repo = yield* HttpClientResponse.schemaBodyJson(Repo)(response)
  return `${repo.full_name}: ${repo.stargazers_count} stars`
})

program.pipe(Effect.provide(FetchHttpClient.layer), Effect.runPromise)
```

- `HttpClient.get` needs the `HttpClient` service.
- `HttpClientResponse.schemaBodyJson(S)` decodes and validates the JSON body.
- `FetchHttpClient.layer` provides an implementation based on `fetch`.

## Building requests

```ts
import { Effect, Schema } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http"

const SearchResult = Schema.Struct({ total_count: Schema.Number })

const search = Effect.gen(function* () {
  const request = HttpClientRequest.get("https://api.github.com/search/repositories").pipe(
    HttpClientRequest.setHeader("Accept", "application/vnd.github+json"),
    HttpClientRequest.bearerToken("ghp_xxxx"),
    HttpClientRequest.setUrlParam("q", "effect language:typescript"),
    HttpClientRequest.setUrlParam("sort", "stars"),
  )
  const response = yield* HttpClient.execute(request)
  return yield* HttpClientResponse.schemaBodyJson(SearchResult)(response)
})
```

- Headers: `setHeader`, `setHeaders`, `bearerToken`, `basicAuth`, `acceptJson`.
- Query string: `setUrlParam`, `setUrlParams`.
- Methods: `HttpClientRequest.get`, `post`, `put`, `patch`, `delete`.

A JSON body goes through a schema too. Encoding can fail, so `HttpClientRequest.schemaBodyJson` returns an `Effect`:

```ts
import { Effect, Schema } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http"

const CreateIssue = Schema.Struct({ title: Schema.String, body: Schema.String })
const Issue = Schema.Struct({ id: Schema.Number, number: Schema.Number, title: Schema.String })

const createIssue = Effect.fn("createIssue")(function* (repo: string, data: typeof CreateIssue.Type) {
  const request = yield* HttpClientRequest.post(`https://api.github.com/repos/${repo}/issues`).pipe(
    HttpClientRequest.schemaBodyJson(CreateIssue)(data),
  )
  const response = yield* HttpClient.execute(request)
  return yield* HttpClientResponse.schemaBodyJson(Issue)(response)
})
```

## Status codes

A response with a 4xx or 5xx status is **not** an error by default. Either fail on any non-2xx status:

```ts
import { Effect, Schema } from "effect"
import { HttpClient, HttpClientResponse } from "effect/http"

const User = Schema.Struct({ id: Schema.Number, login: Schema.String })

const program = Effect.gen(function* () {
  const response = yield* HttpClient.get("https://api.github.com/users/effect-ts")
  yield* HttpClientResponse.filterStatusOk(response) // fails with an HttpClientError (StatusCodeError)
  return yield* HttpClientResponse.schemaBodyJson(User)(response)
})
```

Or handle each status with `matchStatus`, and turn the ones you expect into your own errors:

```ts
import { Effect, Schema } from "effect"
import { HttpClient, HttpClientResponse } from "effect/http"

const User = Schema.Struct({ id: Schema.Number, login: Schema.String })

class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", { username: Schema.String }) {}
class UnexpectedStatus extends Schema.TaggedError<UnexpectedStatus>()("UnexpectedStatus", { status: Schema.Number }) {}

const getUser = Effect.fn("getUser")(function* (username: string) {
  const response = yield* HttpClient.get(`https://api.github.com/users/${username}`)
  return yield* HttpClientResponse.matchStatus(response, {
    "2xx": (r) => HttpClientResponse.schemaBodyJson(User)(r),
    404: () => Effect.fail(new UserNotFound({ username })),
    orElse: (r) => Effect.fail(new UnexpectedStatus({ status: r.status })),
  })
})
// Effect<User, UserNotFound | UnexpectedStatus | SchemaError | HttpClientError, HttpClient>
```

Write each case as a lambda (`(r) => …`): passing `HttpClientResponse.schemaBodyJson(User)` directly makes the error type `unknown`.

## Errors

Every client failure is one `HttpClientError` (`_tag: "HttpClientError"`). Its `reason` says what happened:

| `reason._tag` | When |
|---|---|
| `TransportError` | network failure: connection refused, DNS, aborted request |
| `InvalidUrlError` | the URL cannot be built |
| `EncodeError` | the request body cannot be encoded |
| `StatusCodeError` | a non-2xx status, with `filterStatusOk` / `HttpClient.filterStatusOk` |
| `DecodeError` | the body cannot be read or parsed |
| `EmptyBodyError` | a body was expected and there is none |

A body that is valid JSON but does not match the schema fails with a `SchemaError`, not an `HttpClientError`.

```ts
import { Effect, Schema } from "effect"
import { HttpClient, HttpClientResponse } from "effect/http"

const Repo = Schema.Struct({ id: Schema.Number })

class GitHubUnavailable extends Schema.TaggedError<GitHubUnavailable>()("GitHubUnavailable", {
  reason: Schema.String,
}) {}

const program = Effect.gen(function* () {
  const response = yield* HttpClient.get("https://api.github.com/repos/Effect-TS/effect")
  yield* HttpClientResponse.filterStatusOk(response)
  return yield* HttpClientResponse.schemaBodyJson(Repo)(response)
}).pipe(
  Effect.catchTag("HttpClientError", (error) =>
    error.reason._tag === "StatusCodeError" && error.response?.status === 404
      ? Effect.succeed(null)
      : Effect.fail(new GitHubUnavailable({ reason: error.reason._tag })),
  ),
)
```

`HttpClientError.isHttpClientError(u)` checks an unknown value.

## A typed API client as a service

Wrap a remote API in a service, with a configured client (base URL, headers) built once in the layer:

```ts
import { Context, Effect, Layer, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientError, HttpClientRequest, HttpClientResponse } from "effect/http"

class Repo extends Schema.Class<Repo>("Repo")({
  id: Schema.Number,
  full_name: Schema.String,
  stargazers_count: Schema.Number,
  language: Schema.NullOr(Schema.String),
}) {}

class GitHubApi extends Context.Service<
  GitHubApi,
  {
    readonly getRepo: (owner: string, repo: string) => Effect.Effect<Repo, HttpClientError.HttpClientError | Schema.SchemaError>
    readonly listRepos: (user: string) => Effect.Effect<ReadonlyArray<Repo>, HttpClientError.HttpClientError | Schema.SchemaError>
  }
>()("@app/GitHubApi") {
  static readonly layer = Layer.effect(
    GitHubApi,
    Effect.gen(function* () {
      const client = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest(HttpClientRequest.prependUrl("https://api.github.com")),
        HttpClient.mapRequest(HttpClientRequest.acceptJson),
        HttpClient.filterStatusOk,
      )

      const getRepo = Effect.fn("GitHubApi.getRepo")(function* (owner: string, repo: string) {
        const response = yield* client.get(`/repos/${owner}/${repo}`)
        return yield* HttpClientResponse.schemaBodyJson(Repo)(response)
      })

      const listRepos = Effect.fn("GitHubApi.listRepos")(function* (user: string) {
        const response = yield* client.get(`/users/${user}/repos`)
        return yield* HttpClientResponse.schemaBodyJson(Schema.Array(Repo))(response)
      })

      return { getRepo, listRepos }
    }),
  )

  // Production wiring: the real fetch-based client
  static readonly live = GitHubApi.layer.pipe(Layer.provide(FetchHttpClient.layer))
}

const program = Effect.gen(function* () {
  const github = yield* GitHubApi
  const repo = yield* github.getRepo("Effect-TS", "effect")
  return `${repo.full_name}: ${repo.stargazers_count} stars`
})

program.pipe(Effect.provide(GitHubApi.live), Effect.runPromise)
```

`HttpClient.mapRequest` applies a transformation to every request (base URL, auth, headers); `HttpClient.filterStatusOk` makes every non-2xx response fail.

## Retries

Retry any request with a schedule, or only transient failures with `HttpClient.retryTransient`: timeouts, network errors (`TransportError`) and the statuses 408, 429, 500, 502, 503 and 504. By default (`retryOn: "errors-and-responses"`) it retries both the transient errors and the transient responses, even without `filterStatusOk`; use `retryOn: "errors-only"` or `"response-only"` to narrow it:

```ts
import { Effect, Layer, Schedule, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientResponse } from "effect/http"

const Repo = Schema.Struct({ id: Schema.Number })

// Retry one call
const getRepo = Effect.gen(function* () {
  const response = yield* HttpClient.get("https://api.github.com/repos/Effect-TS/effect")
  return yield* HttpClientResponse.schemaBodyJson(Repo)(response)
}).pipe(Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.upTo({ times: 3 }))))

// Or a client that retries transient failures for every request
const ResilientClient = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    return client.pipe(HttpClient.retryTransient({ times: 3, schedule: Schedule.exponential("100 millis") }))
  }),
).pipe(Layer.provide(FetchHttpClient.layer))

const main = getRepo.pipe(Effect.provide(ResilientClient))
```

## Summary

| Need | API |
|---|---|
| Simple GET | `HttpClient.get(url)` |
| Execute a request | `HttpClient.execute(request)` |
| Build a request | `HttpClientRequest.get`, `post`, `put`, `patch`, `delete` |
| Headers | `HttpClientRequest.setHeader`, `bearerToken`, `basicAuth`, `acceptJson` |
| Query string | `HttpClientRequest.setUrlParam`, `setUrlParams` |
| JSON body | `HttpClientRequest.schemaBodyJson(S)(data)` |
| Decode a response | `HttpClientResponse.schemaBodyJson(S)(response)` |
| Status handling | `HttpClientResponse.matchStatus`, `HttpClientResponse.filterStatusOk` |
| Base URL, auth for all requests | `HttpClient.mapRequest(…)` |
| Fail on every non-2xx | `HttpClient.filterStatusOk` |
| Retries | `Effect.retry(schedule)`, `HttpClient.retryTransient({ times })` |
| Implementation | `FetchHttpClient.layer` |
