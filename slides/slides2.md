---
theme: default
title: "Effect 4 : du TypeScript qui ne ment plus"
info: |
  DevFest Toulouse 2026 — 30 minutes
  Sébastien Pertus
author: Sébastien Pertus
highlighter: shiki
twoslash: true
lineNumbers: false
transition: slide-left
mdc: true
drawings:
  persist: false
class: text-center
---

# Effect 4
## Du TypeScript qui ne ment plus

Sébastien Pertus · DevFest Toulouse 2026

<!--
⏱ 0:00 – 1:00
Accroche : "Qui a déjà eu un `undefined is not a function` en prod un vendredi soir ?"
-->

---
layout: two-cols
---

# Qui suis-je ?

- Sébastien Pertus
- Senior Software Engineer @ Microsoft
- [Ajouter : liens / réseaux / GitHub]

::right::

<!-- [Ajouter : photo ou QR code vers les slides] -->

<!--
⏱ 1:00 – 1:30 — rester très court.
-->

---
layout: section
---

# 1. Le problème
### Un `getUser` qui grandit…

<!-- ⏱ 1:30 – 8:30 -->

---
zoom: 0.85
---

# Le besoin

<v-clicks>

1. Récupérer un utilisateur
2. … proprement, avec `async/await`
3. … et ses **commandes**, en **parallèle**
4. … pour **N utilisateurs**, mais pas plus de **5 à la fois**
5. … en pouvant **tout annuler** (l'utilisateur quitte la page)
6. … avec des **retries** (le réseau, c'est le réseau)
7. … et une **gestion d'erreurs** digne de ce nom
8. *Bonus : un timeout global*
9. … en **validant** ce que renvoie l'API
10. … en **regroupant** les appels (1 000 users ≠ 1 000 requêtes)
11. … et en **testant** le retry sans attendre

</v-clicks>

<!--
Poser le scénario fil rouge : chaque étape est une demande "réaliste" d'un PO ou d'un incident de prod.
-->

---
zoom: 0.72
---

# En TypeScript « classique »

````md magic-move {lines: true}
```ts
// ① Get user, version Promise
function getUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then((res) => res.json())
}
```

```ts
// ② async / await
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}
```

```ts
// ③ Parallélisme : l'utilisateur ET ses commandes
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}
// getOrders(id) : même code, autre URL

async function getUserWithOrders(id: string) {
  const [user, orders] = await Promise.all([getUser(id), getOrders(id)])
  return { ...user, orders }
}

async function getUsersWithOrders(ids: string[]) {
  return Promise.all(ids.map(getUserWithOrders)) // 💥 1 000 ids = 2 000 requêtes d'un coup
}
```

```ts
// ④ Concurrence limitée : 5 utilisateurs à la fois
async function getUserWithOrders(id: string) {
  const [user, orders] = await Promise.all([getUser(id), getOrders(id)])
  return { ...user, orders }
}

async function mapWithConcurrency<T, R>(
  items: T[], limit: number, fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

async function getUsersWithOrders(ids: string[]) {
  return mapWithConcurrency(ids, 5, getUserWithOrders)
}
```

```ts
// ⑤ Interruption : AbortSignal propagé partout… à la main
async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  const res = await fetch(`/api/users/${id}`, { signal })
  return res.json()
}

async function getUserWithOrders(id: string, signal?: AbortSignal) {
  // Promise.all n'annule PAS la requête sœur si l'une échoue
  const controller = new AbortController()
  const onAbort = () => controller.abort(signal?.reason)
  signal?.addEventListener("abort", onAbort)
  try {
    const [user, orders] = await Promise.all([
      getUser(id, controller.signal),
      getOrders(id, controller.signal),
    ])
    return { ...user, orders }
  } catch (e) {
    controller.abort(e)
    throw e
  } finally {
    signal?.removeEventListener("abort", onAbort)
  }
}

async function getUsersWithOrders(ids: string[], signal?: AbortSignal) {
  return mapWithConcurrency(ids, 5, (id) => {
    signal?.throwIfAborted()
    return getUserWithOrders(id, signal)
  })
}
```

```ts
// ⑥ Retry avec backoff exponentiel
async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  return retry(async () => {
    const res = await fetch(`/api/users/${id}`, { signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }, { times: 3, signal })
}

async function retry<T>(
  fn: () => Promise<T>,
  { times, signal }: { times: number; signal?: AbortSignal }
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      if (attempt >= times || signal?.aborted) throw e
      await sleep(100 * 2 ** attempt, signal) // le sleep doit AUSSI être annulable
    }
  }
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    }, { once: true })
  })
}
// getUserWithOrders, getUsersWithOrders, mapWithConcurrency : inchangés
```

```ts
// ⑦ Gestion d'erreurs
class UserNotFound extends Error {
  constructor(readonly id: string) { super(`User ${id} not found`) }
}
class HttpError extends Error {
  constructor(readonly status: number) { super(`HTTP ${status}`) }
}

async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  return retry(async () => {
    const res = await fetch(`/api/users/${id}`, { signal })
    if (res.status === 404) throw new UserNotFound(id)
    if (!res.ok) throw new HttpError(res.status)
    return res.json()
  }, { times: 3, signal, shouldRetry: (e) => !(e instanceof UserNotFound) })
} // 🧰 et retry() doit maintenant accepter une option shouldRetry…

// Côté appelant
try {
  const users = await getUsersWithOrders(ids, controller.signal)
} catch (e) {                                  // e: unknown 🤷
  if (e instanceof UserNotFound) { /* ... */ }
  else if (e instanceof HttpError) { /* ... */ }
  else if (e instanceof DOMException && e.name === "AbortError") { /* ... */ }
  else throw e                                 // TypeError ? JSON invalide ? Autre ?
}
```

```ts
// ⑧ Bonus : timeout global
const controller = new AbortController()
const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5_000)])

try {
  const users = await getUsersWithOrders(ids, signal)
} catch (e) {
  if (e instanceof DOMException && e.name === "TimeoutError") { /* encore un cas… */ }
  // ...
}

// Et toujours : Promise<UserWithOrders[]> 😬
```
````

<!--
Faire défiler les 8 étapes (1 clic = 1 étape), en commentant à chaque fois ce qui a été ajouté.
Étape ④ : la concurrence limitée n'existe pas en natif, il faut un helper (ou p-limit).
Étape ⑤ : le signal pollue TOUTES les signatures ; Promise.all n'annule pas la sœur.
Étape ⑥ : piège classique, le sleep du retry doit lui aussi écouter le signal.
Étape ⑦ : malgré tout ce travail, `catch (e)` reçoit `unknown`.
-->

---

# Le bilan

<v-clicks>

- 🧰 **3 helpers maison** : `mapWithConcurrency`, `retry`, `sleep`
- 🔌 Un `AbortSignal` **propagé à la main** dans chaque signature
- 🧟 `Promise.all` n'annule pas les requêtes sœurs, et les workers continuent après un échec
- 🙈 Les erreurs sont `unknown` : on teste avec `instanceof` et on espère n'en oublier aucune
- 🔍 Pas de logs, pas de traces, difficile à tester (retry = vrais `setTimeout`)
- 😬 Et la signature ? **Toujours** `Promise<UserWithOrders[]>`

</v-clicks>

<!--
Transition : "Et si on refaisait exactement le même chemin avec Effect ?"
-->

---
layout: section
---

# 2. `Effect<A, E, R>`
### Un type qui dit enfin la vérité

<!-- ⏱ 8:30 – 11:00 -->

---

# Trois paramètres, trois vérités

```ts
Effect<A, E, R>
```

| | Signification | Exemple |
|---|---|---|
| **A** | Ce que ça produit en cas de succès | `User` |
| **E** | Les erreurs **attendues**, typées | `UserNotFound \| HttpError` |
| **R** | Les dépendances nécessaires | `HttpClient \| Config` |

<v-click>

> Un `Effect` est une **description** d'un programme : rien ne s'exécute tant qu'on ne le lance pas.
> 👉 Donc on peut le **rejouer** (retry), l'**interrompre**, le **limiter**… sans toucher à son code.

</v-click>

<!--
Analogie : une recette vs le plat.
-->

---

# Premier Effect

```ts twoslash
import { Effect } from "effect"

const hello = Effect.succeed("Hello DevFest")

const boom = Effect.fail("Oups" as const)

const program = Effect.gen(function* () {
  const msg = yield* hello // yield* ≈ await
  return msg.length
})
```

<!--
Survoler les types en direct (Twoslash). E vaut never quand rien ne peut échouer.
-->

---
layout: section
---

# 3. Le même chemin, avec Effect

<!-- ⏱ 11:00 – 17:00 -->

---
zoom: 0.72
---

# `getUser`, version Effect

````md magic-move {lines: true}
```ts
// ① Get user
const getUser = (id: string) =>
  Effect.tryPromise(() =>
    fetch(`/api/users/${id}`).then((res) => res.json() as Promise<User>)
  )
// Effect<User, Cause.UnknownError, never>
```

```ts
// ② Effect.gen ≈ async / await
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(`/api/users/${id}`))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })
```

```ts
// ③ Parallélisme
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(`/api/users/${id}`))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })

const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: "unbounded" })
```

```ts
// ④ Concurrence limitée : un seul mot change
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(`/api/users/${id}`))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })

const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })
```

```ts
// ⑤ Interruption : Effect fournit le signal, et annule tout seul
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise((signal) => fetch(`/api/users/${id}`, { signal }))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })

const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  ) // si getUser échoue, getOrders est interrompu automatiquement

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })

// Côté appelant : on lance… et on peut tout annuler
const fiber = Effect.runFork(getUsersWithOrders(ids))
// l'utilisateur quitte la page :
Effect.runFork(Fiber.interrupt(fiber)) // tout s'arrête, requêtes HTTP comprises
```

```ts
// ⑥ Retry avec backoff exponentiel
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise((signal) => fetch(`/api/users/${id}`, { signal }))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  }).pipe(
    Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 })
  )

const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })
```

```ts
// ⑦ Gestion d'erreurs : typées, et visibles dans la signature
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: string }> {}
class HttpError extends Data.TaggedError("HttpError")<{ status: number }> {}
class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {}

const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: (signal) => fetch(`/api/users/${id}`, { signal }),
      catch: (cause) => new NetworkError({ cause }),
    })
    if (res.status === 404) return yield* new UserNotFound({ id })
    if (!res.ok) return yield* new HttpError({ status: res.status })
    return yield* Effect.promise(() => res.json() as Promise<User>)
  }).pipe(
    Effect.retry({
      schedule: Schedule.exponential("100 millis"),
      times: 3,
      while: (e) => e._tag !== "UserNotFound", // pas de retry sur un 404
    })
  )
// Effect<User, UserNotFound | HttpError | NetworkError, never>
```

```ts
// ⑧ Bonus : timeout global + traces OpenTelemetry
const getUser = (id: string) =>
  Effect.gen(function* () {
    /* ... inchangé ... */
  }).pipe(
    Effect.retry({ /* ... */ }),
    Effect.withSpan("getUser", { attributes: { id } })
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 }).pipe(
    Effect.timeout("5 seconds"),
    Effect.withSpan("getUsersWithOrders")
  )
// Effect<UserWithOrders[], UserNotFound | HttpError | NetworkError | Cause.TimeoutError, never>
```
````

<!--
Même déroulé que la version classique, 1 clic = 1 étape.
Étape ④ : "unbounded" → 5, c'est tout.
Étape ⑤ : aucune signature ne change ; l'interruption est structurée (fibers).
Étape ⑥ : un pipe, pas de helper ; le sleep est interruptible par construction.
Étape ⑦ : survol de la signature = la liste exacte des erreurs.
Étape ⑧ : le timeout ajoute Cause.TimeoutError au type ; withSpan donne des traces sans effort.
-->

---

# Survolons le résultat

```ts twoslash
import { Data, Effect, Schedule } from "effect"
type User = { id: string; name: string }
type Order = { id: string; total: number }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: string }> {}
class HttpError extends Data.TaggedError("HttpError")<{ status: number }> {}
class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {}
declare const getOrders: (id: string) => Effect.Effect<Order[], HttpError | NetworkError>
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: (signal) => fetch(`/api/users/${id}`, { signal }),
      catch: (cause) => new NetworkError({ cause }),
    })
    if (res.status === 404) return yield* new UserNotFound({ id })
    if (!res.ok) return yield* new HttpError({ status: res.status })
    return yield* Effect.promise(() => res.json() as Promise<User>)
  }).pipe(
    Effect.retry({
      schedule: Schedule.exponential("100 millis"),
      times: 3,
      while: (e) => e._tag !== "UserNotFound",
    }),
    Effect.withSpan("getUser", { attributes: { id } })
  )
// ---cut---
const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  )

const program = Effect.forEach(["1", "2", "3"], getUserWithOrders, {
  concurrency: 5,
}).pipe(Effect.timeout("5 seconds"))

program
// ^?
```

<!--
LE moment "wow" : toutes les erreurs possibles apparaissent dans le type, sans rien écrire de plus.
-->

---
layout: section
---

# 4. Aller plus loin
### Trois super-pouvoirs de plus

<!-- ⏱ 17:00 – 21:30 -->

---
zoom: 0.72
---

# ⑨ Valider la réponse de l'API : `Schema`

<div class="grid grid-cols-[1fr_2fr] gap-6">
<div>

### Classique

```ts
const user = (await res.json()) as User
// 🙈 "as" = on fait confiance au backend
// createdAt est une string, pas une Date
```

<v-click>

Avec zod ou valibot : un `safeParse` à brancher, et une erreur de plus noyée dans le `unknown`.

</v-click>

</div>
<div>

### Effect

```ts
import { Schema } from "effect"

const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  createdAt: Schema.DateFromString, // string ISO → Date, automatiquement
})
type User = typeof User.Type

const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({ /* ... inchangé ... */ })
    if (res.status === 404) return yield* new UserNotFound({ id })
    if (!res.ok) return yield* new HttpError({ status: res.status })
    const body = yield* Effect.tryPromise({
      try: () => res.json(),
      catch: (cause) => new NetworkError({ cause }),
    })
    return yield* Schema.decodeUnknownEffect(User)(body)
  }).pipe(
    Effect.retry({
      schedule: Schedule.exponential("100 millis"),
      times: 3,
      while: (e) => e._tag === "HttpError" || e._tag === "NetworkError",
    })
  )
// Effect<User, UserNotFound | HttpError | NetworkError | SchemaError, never>
```

</div>
</div>

<!--
Un JSON inattendu n'est plus un défaut caché : c'est une SchemaError typée, avec un message précis (chemin du champ fautif).
Et on ne relance pas une SchemaError : retry uniquement sur HttpError / NetworkError.
Bonus : Schema transforme aussi (string ISO → Date).
-->

---
zoom: 0.7
---

# ⑩ Regrouper et dédoublonner : `Request` + `RequestResolver`

<div class="grid grid-cols-[1fr_2fr] gap-6">
<div>

### Classique

- 1 000 users = **1 000** `GET /api/users/:id`
- Le même id demandé 2 fois = 2 requêtes
- Solution : DataLoader ou cache maison… à brancher partout

<v-click>

### Effect

- **1 seul** `GET /api/users?ids=1,2,3,…` par lot
- Le code appelant **ne change pas**
- `RequestResolver.withCache` : **dédoublonnage** + cache

</v-click>

</div>
<div>

```ts
import { Effect, Exit, Request, RequestResolver } from "effect"

class GetUserById extends Request.Class<
  { readonly id: string },                // entrées
  User,                                   // succès
  UserNotFound | HttpError | NetworkError // erreurs
> {}

const UserResolver = RequestResolver.make<GetUserById>((entries) =>
  fetchUsersBatch(entries.map((e) => e.request.id)).pipe( // GET /api/users?ids=...
    Effect.map((users) => {
      for (const entry of entries) {
        const user = users.find((u) => u.id === entry.request.id)
        entry.completeUnsafe(
          user ? Exit.succeed(user) : Exit.fail(new UserNotFound({ id: entry.request.id }))
        )
      }
    })
  ) // un échec du lot (HttpError, NetworkError) est propagé à chaque entrée
).pipe(RequestResolver.setDelay("10 millis")) // fenêtre de regroupement

const getUser = (id: string) => Effect.request(new GetUserById({ id }), UserResolver)

// Inchangé : les appels concurrents sont regroupés automatiquement
const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })
```

</div>
</div>

<!--
Même signature pour getUser : Effect<User, UserNotFound | HttpError | NetworkError>.
Les requêtes émises pendant la fenêtre de 10 ms sont regroupées en un seul appel.
La taille d'un lot est bornée par la concurrence : avec concurrency 5, 1 000 users ≈ 200 appels (et non 1 000).
Sans cache, un même id peut partir 2 fois dans un lot, ou être refetché au lot suivant.
RequestResolver.withCache(UserResolver, { capacity: 1024 }) dédoublonne et met en cache (renvoie un Effect : faire un yield*).
Chaque entrée DOIT être complétée (completeUnsafe), sinon l'appelant reste bloqué.
C'est l'équivalent de DataLoader, mais typé et intégré à la concurrence.
-->

---
zoom: 0.75
---

# ⑪ Tester le retry sans attendre : `TestClock`

<div class="grid grid-cols-[1fr_2fr] gap-6">
<div>

### Classique

- `vi.useFakeTimers()`
- `vi.advanceTimersByTimeAsync(...)`
- Mock de `fetch`
- Et l'ordre promesses / timers à dompter 🤯

<v-click>

### Effect

- Le temps est un **service** : en test, on le contrôle
- Le test dure quelques **millisecondes**

</v-click>

</div>
<div>

```ts
import { assert, it } from "@effect/vitest"
import { Effect, Exit, Fiber, Schedule } from "effect"
import { TestClock } from "effect/testing"

it.effect("retry 3 fois avec backoff, sans attendre", () =>
  Effect.gen(function* () {
    let attempts = 0
    const flaky = Effect.suspend(() => {
      attempts++
      return Effect.fail(new HttpError({ status: 503 }))
    })

    const fiber = yield* flaky.pipe(
      Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 }),
      Effect.forkChild
    )

    // 100 + 200 + 400 ms de backoff… simulés instantanément
    yield* TestClock.adjust("1 second")

    const exit = yield* Fiber.await(fiber)
    assert.strictEqual(attempts, 4) // 1 appel + 3 retries
    assert.isTrue(Exit.isFailure(exit))
  })
)
```

</div>
</div>

<!--
it.effect fournit automatiquement un TestClock : le temps n'avance que quand on le décide.
Même principe pour fetch : on fournit un Layer de test (voir section Services & Layers).
-->

---

# Classique vs Effect

| Étape | TypeScript classique | Effect |
|---|---|---|
| async / await | `async` / `await` | `Effect.gen` / `yield*` |
| Parallélisme | `Promise.all` | `Effect.all` / `Effect.forEach` |
| Concurrence limitée | helper maison | `{ concurrency: 5 }` |
| Interruption | `AbortSignal` dans chaque signature | automatique (fibers) |
| Retry | `retry` + `sleep` annulable | `Effect.retry` + `Schedule` |
| Erreurs | `unknown` + `instanceof` | union typée dans `E` |
| Timeout | `AbortSignal.any` + `AbortSignal.timeout` | `Effect.timeout` |
| Traces | à brancher à la main | `Effect.withSpan` |
| Validation | `as User` (ou zod à brancher) | `Schema` + `SchemaError` typée |
| Regroupement des appels | DataLoader ou cache maison | `Request` + `RequestResolver` |
| Tester le retry | fake timers + mocks | `TestClock`, sans attendre |

---
layout: section
---

# 5. Exploiter les erreurs typées

<!-- ⏱ 21:30 – 23:30 -->

---

# Traiter… et voir le type changer

````md magic-move {lines: true}
```ts
const program = getUsersWithOrders(ids)
// Effect<UserWithOrders[], UserNotFound | HttpError | NetworkError | Cause.TimeoutError, never>
```

```ts
const program = getUsersWithOrders(ids).pipe(
  Effect.catchTag("TimeoutError", () => Effect.succeed([]))
)
// Effect<UserWithOrders[], UserNotFound | HttpError | NetworkError, never>
```

```ts
const program = getUsersWithOrders(ids).pipe(
  Effect.catchTags({
    TimeoutError: () => Effect.succeed([]),
    UserNotFound: (e) => Effect.logWarning(`User ${e.id} introuvable`).pipe(Effect.as([])),
    HttpError: (e) => Effect.logError(`HTTP ${e.status}`).pipe(Effect.as([])),
    NetworkError: () => Effect.succeed([]),
  })
)
// Effect<UserWithOrders[], never, never>
```

```ts
// Ou : ne pas tout perdre si UN utilisateur échoue
const program = Effect.partition(ids, getUserWithOrders, { concurrency: 5 })
// Effect<[users: UserWithOrders[], errors: (UserNotFound | HttpError | NetworkError)[]], never, never>
```
````

<v-click>

👉 Le type **montre** les erreurs qui restent à traiter. Exiger `never` à la frontière (handler, `Layer`…) et un oubli devient une erreur de compilation.

</v-click>

---

# Erreurs attendues vs défauts

| | Erreur attendue (`E`) | Défaut (*defect*) |
|---|---|---|
| Exemple | `UserNotFound`, `HttpError` | bug, JSON invalide inattendu |
| Typée ? | ✅ oui | ❌ non |
| Création | `Effect.fail` / `yield* new MyError()` | `Effect.die`, `throw`, `Effect.promise` qui rejette |
| Récupération | `catchTag`, `catchTags`, `partition` | `catchDefect` (rare) |

<!--
Message clé : on ne type que ce qu'on peut raisonnablement gérer.
-->

---
layout: section
---

# 6. Services & Layers
### L'injection de dépendances, typée

<!-- ⏱ 23:30 – 26:00 -->

---

# Sortir `fetch` du code métier

```ts twoslash
import { Context, Data, Effect } from "effect"

type User = { id: string; name: string }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: string }> {}
class HttpError extends Data.TaggedError("HttpError")<{ status: number }> {}
class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {}

class UserRepo extends Context.Service<
  UserRepo,
  {
    readonly findById: (id: string) =>
      Effect.Effect<User, UserNotFound | HttpError | NetworkError>
  }
>()("app/UserRepo") {}

const greet = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* UserRepo
    const user = yield* repo.findById(id)
    return `Bonjour ${user.name} 👋`
  })

const program = greet("42")
//    ^?
```

<!--
Le R vaut maintenant UserRepo : impossible de lancer le programme sans le fournir.
-->

---

# Fournir une implémentation : `Layer`

```ts
import { Effect, Layer } from "effect"

// Convention v4 : `layer` pour la prod, `layerTest` pour les tests
const layer = Layer.succeed(UserRepo, {
  findById: (id) => getUser(id), // notre getUser avec retry, timeout, traces…
})

const layerTest = Layer.succeed(UserRepo, {
  findById: (id) =>
    id === "42"
      ? Effect.succeed({ id, name: "Ada" })
      : Effect.fail(new UserNotFound({ id })),
})

Effect.runPromise(greet("42").pipe(Effect.provide(layer)))     // prod
Effect.runPromise(greet("42").pipe(Effect.provide(layerTest))) // tests
```

<v-click>

👉 Oublier une dépendance = **erreur de compilation**, pas un crash au runtime.

</v-click>

---

# 🎬 Démo live : le retry en action

```ts {monaco-run} {autorun: false}
import { Effect, Schedule } from "effect"

let attempts = 0
const flaky = Effect.suspend(() => {
  attempts++
  console.log(`Tentative ${attempts}`)
  return attempts < 3 ? Effect.fail("Réseau KO") : Effect.succeed("✅ OK")
})

const program = flaky.pipe(
  Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 5 }),
  Effect.tap((r) => Effect.sync(() => console.log(r)))
)

Effect.runPromise(program)
```

<!--
⏱ 26:00 – 27:00 (optionnel si tu es en retard)
[Ajouter : scénario de démo]. Prévoir un plan B (vidéo ou capture) si la démo échoue.
-->

---
layout: section
---

# 7. Et maintenant ?

<!-- ⏱ 27:00 – 30:00 -->

---

# L'écosystème

Depuis Effect 4 : **un seul paquet `effect`**, sans dépendance, et toutes les briques partagent le même numéro de version.

- **`effect`** — le cœur : Effect, Layer, Schedule, Stream, **Schema** (voir étape ⑨)…
- **`effect/http`, `effect/sql`, `effect/rpc`, `effect/cli`…** — intégrés au paquet principal (ex-`@effect/platform`, `@effect/sql`…)
- **`@effect/platform-node` / `-bun` / `-deno` / `-browser`** — les implémentations par plateforme
- **`@effect/sql-pg`, `@effect/sql-sqlite-node`…** — les drivers de base de données
- **`@effect/opentelemetry`** — exporter les traces de `withSpan`
- **`@effect/vitest`** — les tests (voir étape ⑪)
- [Ajouter : autres modules pertinents pour le public]

---

# Quand l'adopter ? (avec honnêteté)

<div class="grid grid-cols-2 gap-8">
<div>

### ✅ Oui si…
- Beaucoup d'I/O, d'erreurs et de dépendances
- Besoin de résilience (retry, timeout, annulation)
- Équipe prête à apprendre un nouveau paradigme

</div>
<div>

### ⚠️ Attention si…
- Petit script ou projet très simple
- Courbe d'apprentissage non budgétée
- Taille du bundle critique

</div>
</div>

<v-click>

👉 Adoption **progressive** possible : `Effect.runPromise` à la frontière de ton code existant.

</v-click>

---

# À retenir

<v-clicks>

1. `Effect<A, E, R>` : un type qui **dit la vérité**
2. Parallélisme, concurrence, interruption, retry : **des options, pas des helpers**
3. Les erreurs sont **typées** et le compilateur vérifie qu'on les traite
4. Les dépendances sont **vérifiées à la compilation**

</v-clicks>

---
layout: center
class: text-center
---

# Merci ! 🙏

Questions ?

[Ajouter : QR code vers les slides et le repo de démo]

effect.website · [Ajouter : contact]

<!--
Garder 2-3 minutes pour les questions si possible.
-->
