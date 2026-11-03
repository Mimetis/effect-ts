---
theme: default
title: "Effect 4 : du TypeScript qui ne ment plus"
info: |
  Effect expliqué aux développeurs qui ne le connaissent pas — version longue.
  Fusion de slides.md (l'histoire des erreurs, les tutoriels du repo)
  et de slides2.md (le getUser qui grandit).
  Les slides marquées ▶ sont exécutables : on modifie le code et on relance.
author: Sébastien Pertus
highlighter: shiki
twoslash: true
lineNumbers: false
transition: slide-left
mdc: true
monacoTypesSource: local
colorSchema: auto
drawings:
  persist: false
class: text-center
---

# Effect 4
## Du TypeScript qui ne ment plus

La gestion d'erreurs (et tout le reste), enfin typée

<div class="tech-prompt mt-6">pnpm add effect</div>

<div class="mt-8">

Sébastien Pertus · DevFest Toulouse 2026

</div>

<div class="abs-br m-6 text-sm opacity-50 font-mono">
  effect 4.0
</div>

<!--
Accroche : "Qui a déjà eu un `undefined is not a function` en prod un vendredi soir ?"
-->

---
layout: two-cols
layoutClass: gap-10
---

# Qui suis-je ?

<div class="flex items-center gap-5 mb-3">
  <div class="flex-none rounded-full overflow-hidden shadow-lg ring-2 ring-gray-400/30" style="width: 6rem; height: 6rem">
    <img src="./images/sebastien_pertus.jpg" alt="Sébastien Pertus" style="width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; transform: scale(1.5); transform-origin: 50% 32%" />
  </div>
  <div>
    <div class="text-2xl font-bold">Sébastien Pertus</div>
    <div class="opacity-80">Senior Software Engineer @ <b>Microsoft Frontier Company</b></div>
  </div>
</div>

Des ingénieurs Microsoft **intégrés chez nos clients** pour concevoir, déployer et faire tourner l'IA en production.

<div class="flex gap-5 text-sm mt-2">
  <a href="https://github.com/mimetis" class="flex items-center gap-1"><div class="i-carbon-logo-github" /> mimetis</a>
  <a href="https://www.linkedin.com/in/sebastienpertus" class="flex items-center gap-1"><div class="i-carbon-logo-linkedin" /> sebastienpertus</a>
</div>

<div class="mt-5 text-xs uppercase tracking-widest opacity-60">Ces dernières années, aux côtés de</div>
<div class="grid grid-cols-3 gap-3 mt-2">
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/kuka.svg" alt="KUKA" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/coca-cola.svg" alt="Coca-Cola" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-1 shadow-sm"><img src="./images/logos/pg.svg" alt="P&amp;G" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/cdiscount.png" alt="Cdiscount" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><span class="text-gray-800 font-bold tracking-[0.2em] text-sm">MULLIEZ</span></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/lvmh.svg" alt="LVMH" class="max-h-full max-w-full object-contain" /></div>
</div>

::right::

<div class="h-full flex flex-col justify-center">
  <img src="./images/microsoft_frontier.png" alt="Microsoft Frontier Company : AI engineering that amplifies and protects your intelligence" class="rounded-lg shadow-xl" />
  <div class="mt-3 text-xs opacity-60 text-center">
    <a href="https://www.microsoft.com/en-us/frontier-company">microsoft.com/frontier-company</a>
  </div>
</div>

<!--
Rester très court.
Frontier Company : modèle « Forward Deployed Engineering », des ingénieurs Microsoft embarqués chez le client, orientés résultats mesurables.
Annonce : « Microsoft Frontier Company: AI engineering that amplifies and protects your intelligence », Judson Althoff, 2 juillet 2026.
-->
---

# Au programme

<div class="grid grid-cols-2 gap-x-12 text-left mt-6">
<div>

1. Les erreurs : une longue histoire
2. `Effect<A, E, R>` : les bases
3. Un `getUser` qui grandit
4. Le même chemin, avec Effect
5. Exploiter les erreurs typées

</div>
<div>

6. Valider ce qui vient de l'extérieur
7. Services & Layers
8. Aller plus loin
9. En vrai : un serveur Express
10. Et maintenant ?

</div>
</div>


<!--
Le code des slides ▶ tourne dans le navigateur : pas de réseau, pas de terminal.
Les types Effect sont chargés dans l'éditeur : on peut survoler et voir les erreurs de compilation en direct.
-->

---
layout: section
---

# 1. Les erreurs
### Une longue histoire de mensonges

---

# Gérer les erreurs : un éternel recommencement

Chaque solution corrige le défaut de la précédente… et en crée un nouveau

<div class="tl">
  <div class="tl-row tl-head">
    <span>Approche</span><span>À quoi ça ressemble</span><span>✅ On gagne</span><span>❌ Mais…</span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">🔢 Codes d'erreur<small>C, POSIX</small></div>
    <code>const fd = open(path) // -1 ?</code>
    <span>Simple et explicite</span>
    <span>Rien n'oblige à vérifier : on <b>oublie</b>, le bug passe en silence</span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">💥 Exceptions<small>C++, Java, JS</small></div>
    <code>throw new Error("boom")</code>
    <span>Impossible d'ignorer l'erreur</span>
    <span><b>Invisible</b> dans la signature : on le découvre en prod</span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">☕ Checked exceptions<small>Java</small></div>
    <code>User load() throws IOException</code>
    <span>L'erreur est dans la signature</span>
    <span><code>throws</code> partout… alors on écrit <code>catch (e) {}</code></span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">📦 Result / Either<small>Rust, Go, neverthrow</small></div>
    <code>Result&lt;User, NotFound&gt;</code>
    <span>Erreur <b>typée</b>, retournée comme une valeur</span>
    <span>Async, retry, timeout, dépendances : <b>tout à la main</b></span>
  </div>
  <div v-click class="tl-row tl-effect">
    <div class="tl-name">✨ Effect<small>TypeScript</small></div>
    <code>Effect&lt;User, NotFound, Db&gt;</code>
    <span>Erreurs <b>et</b> dépendances typées</span>
    <span>➕ Retry, timeout, concurrence… <b>intégrés</b></span>
  </div>
</div>

<!--
Lire chaque ligne de gauche à droite : le "Mais…" d'une ligne est exactement ce que la ligne suivante essaie de corriger.
Codes d'erreur → on oublie de vérifier. Exceptions → on ne peut plus oublier, mais on ne sait plus ce qui peut échouer.
Checked exceptions → on le sait, mais c'est si lourd qu'on finit par tout avaler. Result → typé et léger, mais tout le reste est à faire soi-même.
Effect garde le "typé" de Result et ajoute ce qui manquait.
-->

---


# Le problème

```ts
async function getUser(id: string): Promise<User> {
  // Quelles erreurs peut-on recevoir ici ? 🤷
}
```

<v-clicks>

- La signature **ment** : les erreurs ne sont pas dans le type
- `try / catch` reçoit un `unknown`
- Rien n'oblige l'appelant à gérer les cas d'échec

</v-clicks>

---
zoom: 0.85
---

# ▶ `try / catch` : la signature ment

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `Promise<User>` ne dit **rien** des erreurs
- On peut `throw` **n'importe quoi**, même une `string`
- Dans le `catch`, `e` est `unknown` : survolez-le

👉 Essayez les ids `1`, `0`, `999`

</div>
<div>

```ts {monaco-run} {autorun: false}
class UserNotFound extends Error {}

// La signature promet un User… et ne dit rien des erreurs
async function getUser(id: number): Promise<{ id: number; name: string }> {
  if (id <= 0) throw "id invalide" // on peut throw… n'importe quoi
  if (id > 100) throw new UserNotFound(`User ${id} introuvable`)
  return { id, name: `User ${id}` }
}

try {
  const user = await getUser(999)
  console.log("✅", user.name)
} catch (e) { // 👈 survolez e : unknown
  if (e instanceof UserNotFound) console.log("🔍", e.message)
  else console.log("🤷 erreur inattendue :", e)
}
```

</div>
</div>

<!--
Avec 0 : la string "id invalide" tombe dans le cas "inattendu". Personne ne l'avait prévue.
-->

---
zoom: 0.85
---

# Première idée : des tuples `[data, error]`

```ts 
export async function catchErrorTyped<T, E extends readonly BaseError[]>(promise: Promise<T>, errors: E) {
    try {
        return [await promise, null];
    } catch (error) {
        if (errors.some(e => error instanceof e)) 
            return [null, error as InstanceType<E[number]>];
        throw error;
    }
}
```

```ts
class UserInvalidUserId extends Error { readonly name = "UserInvalidUserId"}
class UserNotFound extends Error { readonly name = "UserNotFound" }

const [user, error] = await catchErrorTyped(getUser(id), [UserInvalidUserId, UserNotFound])

if (error) {
  if (error instanceof UserInvalidUserId) console.error(error.message)
  else if (error instanceof UserNotFound) console.error(error.message)
} else {
  console.log(user) // ✅ user ne peut pas être null ici
}
```

<v-click>

Ça marche, mais :
- il faut **déclarer les erreurs à chaque appel**
- si `getUser()` ajoute demain un `UnauthorizedError`, **rien ne le signale**

</v-click>

<!--
📁 tutorial01/script.ts, étapes 2 et 3 — pnpm start:tutorial01
-->

---
zoom: 0.85
---

# ▶ Mieux : un `Result` (neverthrow)

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- L'erreur fait **partie du type de retour**
- `result.error` est typé : le `switch` est vérifié
- Plus de `unknown` 🎉

👉 Essayez les ids `1`, `0`, `999`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { err, ok, type Result } from "neverthrow"

class InvalidUserId extends Error { readonly _tag = "InvalidUserId" }
class UserNotFound extends Error { readonly _tag = "UserNotFound" }
type User = { id: number; name: string }

// ✅ Les erreurs sont enfin dans la signature
function getUser(id: number): Result<User, InvalidUserId | UserNotFound> {
  if (id <= 0) return err(new InvalidUserId(`id ${id} invalide`))
  if (id > 100) return err(new UserNotFound(`User ${id} introuvable`))
  return ok({ id, name: `User ${id}` })
}

const result = getUser(999)
if (result.isErr()) {
  switch (result.error._tag) { // l'erreur est typée
    case "InvalidUserId": console.log("⚠️", result.error.message); break
    case "UserNotFound": console.log("🔍", result.error.message); break
  }
} else {
  console.log("✅", result.value.name)
}
```

</div>
</div>

<!--
📁 tutorial01/script.ts, étape 4.
-->

---

# `Result` : un vrai progrès… mais

<v-clicks>

- ✅ Les erreurs entrent **enfin** dans le type
- 🧤 Tout ce qui peut `throw` (`fetch`, `JSON.parse`…) doit être **encapsulé à la main**
- 🔀 `Promise<Result>` ou `ResultAsync` : deux mondes à jongler
- 🚫 Concurrence, annulation, retry, timeout, dépendances : **rien de prévu**

</v-clicks>

<v-click>

👉 Et si **un seul type** portait les erreurs… **et** tout le reste ?

</v-click>

<!--
Transition vers Effect : on reprend exactement le même getUser, en version Effect.
-->

---
layout: section
---

# 2. `Effect<A, E, R>`
### Un type qui dit enfin la vérité

---
zoom: 0.9
---

# Trois paramètres, trois vérités

Effect: Décrire le résultat, les erreurs, les dépendances

# `Effect<A, E, R>`
```ts
const UserEffect:Effect<User, InvalidUserId | UserNotFound, never>  // Effect      : les erreurs ✅ les dépendances ✅
```

<v-click>

| | Signification | Pour `getUser` |
|---|---|---|
| **A** | Ce que ça produit en cas de succès | `User` |
| **E** | Les erreurs **attendues**, typées | `InvalidUserId \| UserNotFound` |
| **R** | Les dépendances nécessaires | `never` : aucune… pour l'instant (section 7) |

> Un `Effect` est une **description** d'un programme : rien ne s'exécute tant qu'on ne le lance pas.
 
> 👉 Donc on peut le **rejouer** (retry), l'**interrompre**, le **limiter**… sans toucher à son code.

</v-click>

<!--
Analogie : une recette vs le plat.
R = never ici ; on verra en section 7 un getUser qui dépend d'un UserRepository.
-->

---
zoom: 0.85
---

# ▶ Premier Effect

<div class="grid grid-cols-[1fr_1fr] gap-6">
<div>

- `Effect.succeed(v)` : un Effect qui **réussit**
- `Effect.fail(e)` : un Effect qui **échoue**
- L'erreur est **dans le type** : survolez `hello` et `boom`
- Un Effect est une **description** : rien ne s'exécute avant `run*`


</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const hello = Effect.succeed("Hello DevFest") 
const boom = Effect.fail("Oups")              

console.log("— rien n'a encore été exécuté —")

console.log(Effect.runSync(hello))
console.log(Effect.runSyncExit(hello))
console.log(Effect.runSyncExit(boom))
```

</div>
</div>

<!--
Effect<A, E, R> : A = ce qu'on obtient, E = ce qui peut échouer, R = les dépendances (on y revient plus tard).
E vaut never quand rien ne peut échouer ; A vaut never quand rien ne peut réussir.
Essayer Effect.runSync(boom) : ça lève une exception, d'où runSyncExit.
-->

---
zoom: 0.85
---

# ▶ Composer : `pipe`, `map` et `flatMap`

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `x.pipe(f, g)` = `g(f(x))` : on enchaîne des étapes
- `map` : **transforme** la valeur de succès
- `flatMap` : **enchaîne** un autre Effect… et **ajoute** ses erreurs au type
- Survolez `length` puis `checked` : `E` passe de `never` à `string`

👉 Essayez `n > 5`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const hello = Effect.succeed("Hello DevFest")

// map : transformer la valeur de succès
const length = hello.pipe( // 👈 survolez : Effect<number, never, never>
  Effect.map((msg) => msg.length),
)

// flatMap : enchaîner un autre Effect… qui peut échouer
const checked = length.pipe( // 👈 survolez : Effect<number, string, never>
  Effect.flatMap((n) => n > 20 ? Effect.succeed(n) : Effect.fail(`Trop court : ${n}`)),
)

console.log(Effect.runSyncExit(length))
console.log(Effect.runSyncExit(checked))
```

</div>
</div>

<!--
Analogie : map / flatMap sur un tableau, ou then sur une Promise… mais l'erreur reste typée.
Si une étape échoue, les suivantes ne s'exécutent pas : l'erreur court-circuite la chaîne.
-->

---
zoom: 0.8
---

# ▶ Le même `getUser`, avec Effect

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- Le **même exemple** qu'avec `try/catch` et neverthrow
- Deux petites fonctions, chacune avec **son** erreur
- `flatMap` les enchaîne : survolez `getUser`, les **deux** erreurs sont dans le type
- `catchTags` : chaque erreur traitée par son `_tag`

👉 Essayez les ids `1`, `0`, `999`… et survolez `program`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

class InvalidUserId extends Data.TaggedError("InvalidUserId")<{ id: number }> {}
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
type User = { id: number; name: string }

// 1. Valider l'id
const validateId = (id: number): Effect.Effect<number, InvalidUserId> =>
  id > 0 ? Effect.succeed(id) : Effect.fail(new InvalidUserId({ id }))

// 2. Chercher l'utilisateur
const findUser = (id: number): Effect.Effect<User, UserNotFound> =>
  id <= 100 ? Effect.succeed({ id, name: `User ${id}` }) : Effect.fail(new UserNotFound({ id }))

// 3. Enchaîner : les deux erreurs s'additionnent dans le type
const getUser = (id: number) => // 👈 survolez getUser
  validateId(id).pipe(Effect.flatMap(findUser))

const program = getUser(999).pipe( // 👈 survolez program
  Effect.map((user) => `✅ ${user.name}`),
  Effect.catchTags({
    InvalidUserId: (e) => Effect.succeed(`⚠️ id ${e.id} invalide`),
    UserNotFound: (e) => Effect.succeed(`🔍 User ${e.id} introuvable`),
  }),
)

console.log(Effect.runSync(program))
```

</div>
</div>

<!--
3e version du même getUser : même comportement que les slides try/catch et neverthrow.
getUser vaut Effect<User, InvalidUserId | UserNotFound, never> sans l'avoir écrit : flatMap a additionné les erreurs.
Au survol, program vaut Effect<string, never, never> : E = never, toutes les erreurs ont été traitées.
-->

---
zoom: 0.85
---

# ▶ Une Promise court déjà, un Effect attend

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- Une `Promise` démarre **dès sa création**
- Un `Effect` est une **description** : rien ne se passe avant `run*`
- Donc on peut le **rejouer**, le **retarder**, l'**interrompre**…

👉 Lancez et regardez **l'ordre** des logs

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const promise = new Promise<number>((resolve) => {
  console.log("🏃 Promise : je démarre tout de suite !")
  resolve(999)
})

const effect = Effect.sync(() => {
  console.log("🧘 Effect : je démarre quand on me lance")
  return 42
})

console.log("— rien n'a encore été lancé —")

console.log(await Effect.runPromise(effect))
console.log(await Effect.runPromise(effect)) // une description se rejoue
console.log(await promise) // la Promise, elle, ne se rejoue pas
```

</div>
</div>

<!--
C'est LA différence fondamentale : c'est ce qui rend possibles retry, timeout, interruption… sans toucher au code.
-->

---
zoom: 0.85
---

# ▶ Créer et lancer un Effect

<div class="grid grid-cols-[1fr_1.8fr] gap-6">
<div>

| Créer | à partir de… |
|---|---|
| `Effect.succeed(v)` | une valeur |
| `Effect.fail(e)` | une erreur typée |
| `Effect.sync(f)` | du code qui ne throw pas |
| `Effect.try(…)` | du code qui peut throw |
| `Effect.tryPromise(…)` | une `Promise` |

`runSync`, `runPromise`… ou `run*Exit` pour obtenir un `Exit` : **Success** ou **Failure**.

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const ok = Effect.succeed(42) // 👈 survolez : Effect<number, never, never>
const ko = Effect.fail("💥 boom") // Effect<never, string, never>

const parse = (json: string) =>
  Effect.try({
    try: () => JSON.parse(json) as unknown,
    catch: () => "JSON invalide", // l'erreur rejoint le type
  })

console.log(Effect.runSync(ok))
console.log(Effect.runSyncExit(ko))
console.log(Effect.runSyncExit(parse('{ "ok": true }')))
console.log(Effect.runSyncExit(parse("{ oops")))
```

</div>
</div>

<!--
📁 tutorial02/script.ts — pnpm start:tutorial02
runSync(ko) lève une exception : le runner l'affiche en rouge.
-->

---
zoom: 0.85
---

# ▶ Deux styles : `gen` et `pipe`

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `Effect.gen` + `yield*` ≈ `async` + `await`
- `x.pipe(f, g)` = `g(f(x))`
- En pratique : **gen** pour la logique, **pipe** pour ajouter des comportements (retry, timeout, logs…)

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const getUser = (id: number) => Effect.succeed({ id, name: `ada ${id}` })

// Style « générateur » : se lit comme du async / await
const withGen = Effect.gen(function* () {
  const user = yield* getUser(1)
  return user.name.toUpperCase()
})

// Style « pipe » : une chaîne de transformations
const withPipe = getUser(1).pipe(
  Effect.map((user) => user.name),
  Effect.map((name) => name.toUpperCase()),
)

console.log(Effect.runSync(withGen), Effect.runSync(withPipe))

// On ajoute des comportements sans toucher à la logique
const resilient = withGen.pipe(
  Effect.timeout("1 second"),
  Effect.retry({ times: 3 }),
  Effect.tap((name) => Effect.log(`👋 ${name}`)),
)
console.log(await Effect.runPromise(resilient))
```

</div>
</div>

<!--
Effect.log affiche l'heure et la fibre (#3) : on s'en servira pour visualiser la concurrence.
-->

---
zoom: 0.7
---

# ▶ Les erreurs s'additionnent… dans le type

<div class="grid grid-cols-[1fr_2.6fr] gap-6">
<div>

- Le même `getUser`… plus un `getCountry`
- Chaque fonction **déclare** ses erreurs
- `yield*` les **additionne** : survolez `program`
- `catchTags` les traite une à une
- `Effect<string>` = `E` vaut `never` : **tout** doit être traité

👉 Retirez une ligne de `catchTags`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

class InvalidUserId extends Data.TaggedError("InvalidUserId")<{ id: number }> {}
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class CountryNotFound extends Data.TaggedError("CountryNotFound")<{ id: number }> {}
type User = { id: number; name: string }

const getUser = (id: number): Effect.Effect<User, InvalidUserId | UserNotFound> =>
  id <= 0 ? Effect.fail(new InvalidUserId({ id }))
  : id > 100 ? Effect.fail(new UserNotFound({ id }))
  : Effect.succeed({ id, name: `User ${id}` })

const getCountry = (user: User): Effect.Effect<string, CountryNotFound> =>
  user.id === 31 ? Effect.fail(new CountryNotFound({ id: user.id }))
  : Effect.succeed(user.id > 50 ? "France" : "Belgique")

const program = (id: number) => // 👈 survolez : les 3 erreurs sont dans le type
  Effect.gen(function* () {
    const user = yield* getUser(id) // yield* ≈ await
    const country = yield* getCountry(user)
    return `✅ ${user.name} (${country})`
  })

const describe = (id: number): Effect.Effect<string> =>
  program(id).pipe(
    Effect.catchTags({
      InvalidUserId: (e) => Effect.succeed(`⚠️ id invalide : ${e.id}`),
      UserNotFound: (e) => Effect.succeed(`🔍 introuvable : ${e.id}`),
      CountryNotFound: (e) => Effect.succeed(`🌍 pays inconnu : ${e.id}`),
    }),
  )

for (const id of [1, 99, 0, 999, 31]) console.log(Effect.runSync(describe(id)))
```

</div>
</div>

<!--
📁 tutorial02/script.ts (le user 31, de Toulouse, est rejeté 😉).
En retirant une ligne de catchTags, `describe` ne compile plus : l'erreur restante n'est pas traitée.
-->
---
layout: section
---

# 3. Un `getUser` qui grandit…
### Le fil rouge : un cas réaliste

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
Transition : "On connaît maintenant Effect : refaisons exactement le même chemin avec lui."
-->
---
layout: section
---

# 4. Le même chemin, avec Effect

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
zoom: 0.85
---

# ▶ Concurrence : une option, pas un helper

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `Effect.forEach` + `{ concurrency: n }`
- Chaque tâche tourne dans une **fibre** : `#2`, `#3`… dans les logs
- Regardez les horodatages

👉 Essayez `1`, `3` ou `"unbounded"`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

// Une "requête" qui prend 300 ms
const fetchUser = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.log(`▶️ user ${id}`)
    yield* Effect.sleep("300 millis")
    return { id, name: `User ${id}` }
  })

const ids = [1, 2, 3, 4, 5, 6]

const program = Effect.forEach(ids, fetchUser, { concurrency: 2 })

const start = Date.now()
const users = await Effect.runPromise(program)
console.log(`⏱ ${users.length} users en ${Date.now() - start} ms`)
```

</div>
</div>

<!--
Étape ④ du fil rouge : en classique il fallait écrire mapWithConcurrency (ou ajouter p-limit).
-->

---
zoom: 0.85
---

# ▶ `Promise.all` : la requête zombie

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- `getUser` échoue au bout de 100 ms
- `Promise.all` rejette… mais **n'annule rien**
- La requête `orders` continue dans le vide 🧟
- Pour l'annuler : un `AbortController` à propager **partout** (étape ⑤)

</div>
<div>

```ts {monaco-run} {autorun: false}
// Un faux fetch qui respecte l'AbortSignal, comme le vrai
const fakeFetch = (url: string, signal?: AbortSignal) =>
  new Promise<unknown[]>((resolve, reject) => {
    console.log(`🌐 GET ${url}`)
    const timer = setTimeout(() => {
      console.log(`🧟 GET ${url} terminé… mais plus personne n'attend`)
      resolve([])
    }, 1000)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })

async function getUser(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 100))
  throw new Error(`User ${id} introuvable`)
}

const getOrders = (id: number) => fakeFetch(`/api/users/${id}/orders`)

try {
  await Promise.all([getUser(1), getOrders(1)])
} catch (e) {
  console.log("❌", (e as Error).message)
}
```

</div>
</div>

<!--
Le log 🧟 arrive presque une seconde APRÈS l'erreur : la requête a été payée pour rien.
-->

---
zoom: 0.8
---

# ▶ `Effect.all` : annulation automatique

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- Le même scénario
- `tryPromise((signal) => …)` : Effect **fournit** l'`AbortSignal`
- Dès que `getUser` échoue, la fibre sœur est **interrompue**… et le `fetch` **annulé**
- Zéro ligne de plomberie

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

// Le même faux fetch, qui respecte l'AbortSignal
const fakeFetch = (url: string, signal?: AbortSignal) =>
  new Promise<unknown[]>((resolve, reject) => {
    console.log(`🌐 GET ${url}`)
    const timer = setTimeout(() => resolve([]), 1000)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      console.log(`🛑 GET ${url} annulé`)
      reject(signal.reason)
    })
  })

const getUser = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.sleep("100 millis")
    return yield* Effect.fail(`User ${id} introuvable`)
  })

// Effect fournit le signal… et l'annule si on n'a plus besoin du résultat
const getOrders = (id: number) =>
  Effect.tryPromise((signal) => fakeFetch(`/api/users/${id}/orders`, signal))

await Effect.runPromise(
  Effect.all([getUser(1), getOrders(1)], { concurrency: "unbounded" }).pipe(
    Effect.catch((error) => Effect.log(`❌ ${error}`)),
  ),
)
```

</div>
</div>

<!--
Étape ⑤ : aucune signature ne change, l'interruption est structurée (les fibres enfants suivent leur parent).
-->

---
zoom: 0.85
---

# ▶ Retry : rejouer une description

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- L'API échoue 2 fois, puis répond
- `Schedule.exponential("100 millis")` : 100 ms, 200 ms, 400 ms…
- Regardez les horodatages des logs

👉 Essayez `times: 1`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect, Schedule } from "effect"

let attempts = 0
const flakyApi = Effect.gen(function* () {
  attempts++
  yield* Effect.log(`📡 tentative ${attempts}`)
  if (attempts < 3) return yield* Effect.fail("503 Service Unavailable")
  return "✅ OK"
})

// Un Effect est une description : le retry la rejoue
const program = flakyApi.pipe(
  Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 5 }),
)

console.log(await Effect.runPromise(program))
```

</div>
</div>

<!--
Étape ⑥ : pas de helper retry, pas de sleep annulable à écrire.
Avec times: 1, l'erreur finale remonte : le runner l'affiche en rouge.
-->

---
zoom: 0.85
---

# ▶ Timeout : on répond… et on nettoie

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `Effect.timeout` ajoute `TimeoutError` au type
- La requête lente est **interrompue** : `onInterrupt` s'exécute
- Avec `Promise.race`, elle continuerait en arrière-plan

👉 Essayez `"3 seconds"`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const slowApi = Effect.gen(function* () {
  yield* Effect.log("🐢 requête lente…")
  yield* Effect.sleep("2 seconds")
  return "📦 réponse"
}).pipe(
  Effect.onInterrupt(() => Effect.log("🧹 interrompue : ressources libérées")),
)

const program = slowApi.pipe(
  Effect.timeout("500 millis"),
  Effect.catchTag("TimeoutError", () => Effect.succeed("⏱ trop long : valeur par défaut")),
)

console.log(await Effect.runPromise(program))
```

</div>
</div>

<!--
Étape ⑧. 📁 tutorial05 montre le même contraste côté serveur : Promise.race répond mais laisse tourner le travail.
-->

---
layout: section
---

# 5. Exploiter les erreurs typées

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
zoom: 0.85
---

# ▶ Tout ou rien… ou rien de perdu

<div class="grid grid-cols-[1fr_2.6fr] gap-6">
<div>

- `forEach` : la première erreur gagne
- `partition` : succès et erreurs séparés, **typés**
- `catchTag` : traite **une** erreur, qui disparaît du type (survolez `guest`)

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class HttpError extends Data.TaggedError("HttpError")<{ status: number }> {}
type User = { id: number; name: string }

const getUser = (id: number): Effect.Effect<User, UserNotFound | HttpError> =>
  id === 404 ? Effect.fail(new UserNotFound({ id }))
  : id === 500 ? Effect.fail(new HttpError({ status: 500 }))
  : Effect.succeed({ id, name: `User ${id}` })

const ids = [1, 404, 2, 500, 3]

// 1. Tout ou rien : la première erreur gagne
console.log(await Effect.runPromiseExit(Effect.forEach(ids, getUser)))

// 2. Ne rien perdre : les succès d'un côté, les erreurs de l'autre
const [users, errors] = await Effect.runPromise(Effect.partition(ids, getUser))
console.log("✅", users.map((user) => user.name).join(", "))
console.log("❌", errors)

// 3. Traiter UNE erreur : elle disparaît du type (survolez `guest`)
const guest = getUser(404).pipe(
  Effect.catchTag("UserNotFound", () => Effect.succeed({ id: 0, name: "Invité" })),
)
console.log("🎭", (await Effect.runPromise(guest)).name)
```

</div>
</div>

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
zoom: 0.85
---

# ▶ Erreur attendue ou défaut ?

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `Fail` : prévue, typée, dans `E`
- `Die` : un **bug**, hors du type
- Un `Effect.sync` qui throw = un défaut
- `catchDefect` existe… mais on préfère corriger le bug !

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

// ✅ Erreur attendue : prévue, typée, dans E
const expected = Effect.fail(new UserNotFound({ id: 42 }))

// 💥 Défaut : Effect.sync promet de ne jamais throw… raté
const defect = Effect.sync((): unknown => JSON.parse("{ oops"))

console.log(await Effect.runPromiseExit(expected))
console.log(await Effect.runPromiseExit(defect))

// Un défaut n'est pas dans E… mais on peut quand même l'attraper
const safe = defect.pipe(
  Effect.catchDefect((cause) => Effect.succeed(`🩹 défaut rattrapé : ${cause}`)),
)
console.log(await Effect.runPromise(safe))
```

</div>
</div>

<!--
C'est la 2e règle du début : toutes les erreurs ne se valent pas.
-->

---
layout: section
---

# 6. Valider ce qui vient de l'extérieur
### `Schema` et `Config`

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
zoom: 0.69
---

# ▶ `Schema` : un type qui existe à l'exécution

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- Un type TypeScript **disparaît** à l'exécution, un `Schema` **reste**
- Il **valide** et **transforme** (`string` → `Date`)
- Le type est **déduit** du schéma : survolez `User`
- `errors: "all"` : toutes les erreurs, avec leur chemin

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect, Schema } from "effect"

const User = Schema.Struct({
  id: Schema.Int.check(Schema.isGreaterThan(0)),
  name: Schema.NonEmptyString,
  email: Schema.NonEmptyString,
  createdAt: Schema.DateFromString, // string ISO → Date
})
type User = typeof User.Type // 👈 le type est déduit du schéma

// Ce que renvoie la base de données : du unknown
const rows: ReadonlyArray<unknown> = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", createdAt: "1815-12-10" },
  { id: "2", name: "", email: null, createdAt: "hier" },
]

const decodeUser = Schema.decodeUnknownEffect(User, { errors: "all" })

for (const row of rows) {
  const message = await Effect.runPromise(
    decodeUser(row).pipe(
      Effect.match({
        onSuccess: (user) => `✅ ${user.name} (${user.createdAt.getFullYear()})`,
        onFailure: (error) => `❌ ${error.message}`, // SchemaError typée
      }),
    ),
  )
  console.log(message)
}
```

</div>
</div>

<!--
Les deux lignes sont celles de tutorial04 / tutorial05 : la ligne 2 passe avec `as User`… et casse plus loin.
-->

---
zoom: 0.73
---

# ▶ `Config` : le `.env` validé au démarrage

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- `Config` lit l'environnement, `Schema` valide
- `constantCase` : `app.apiUrl` → `APP_API_URL`
- `Redacted` : la clé n'apparaît **jamais** dans les logs

👉 Essayez `APP_PORT: "70000"`, ou supprimez une variable

📁 `tutorial03/config.ts`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Config, ConfigProvider, Effect, Schema } from "effect"

const AppConfig = Schema.Struct({
  name: Schema.NonEmptyString,
  port: Schema.Int.check(Schema.isBetween({ minimum: 3000, maximum: 9999 })),
  apiUrl: Schema.URL,
  apiKey: Schema.Redacted(Schema.NonEmptyString),
})

// Le fichier .env, simulé
const env = {
  APP_NAME: "devfest-demo",
  APP_PORT: "8080",
  APP_API_URL: "https://api.example.com",
  APP_API_KEY: "s3cr3t",
}

const program = Effect.gen(function* () {
  const config = yield* Config.schema(AppConfig, "app")
  yield* Effect.log(`🚀 ${config.name} sur le port ${config.port}`)
  yield* Effect.log(`🌐 API : ${config.apiUrl.host}`)
  yield* Effect.log(`🔑 clé : ${config.apiKey}`) // Redacted : jamais affichée
})

await Effect.runPromise(
  program.pipe(
    Effect.provideService(
      ConfigProvider.ConfigProvider,
      ConfigProvider.fromEnv({ env }).pipe(ConfigProvider.constantCase),
    ),
    Effect.catchTag("ConfigError", (error) => Effect.log(`❌ ${error.message}`)),
  ),
)
```

</div>
</div>

<!--
Dans le tutoriel, fromEnv() lit le vrai .env chargé par node --env-file : pnpm start:tutorial03:config
-->

---
layout: section
---

# 7. Services & Layers
### L'injection de dépendances, typée

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
zoom: 0.77
---

# ▶ Changer d'implémentation sans toucher au métier

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- `greet` ne connaît que le **contrat**
- Un `Layer` par implémentation : mock, API, PostgreSQL…

👉 Supprimez un `Effect.provide` : soulignement rouge… et `Service not found` si on lance quand même

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Context, Data, Effect, Layer } from "effect"

type User = { id: number; name: string }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

// 1. Le contrat
class UserRepository extends Context.Service<UserRepository, {
  readonly getById: (id: number) => Effect.Effect<User, UserNotFound>
}>()("UserRepository") {}

// 2. La logique métier ne connaît que le contrat
const greet = (id: number) => // 👈 survolez : R = UserRepository
  Effect.gen(function* () {
    const repository = yield* UserRepository
    const user = yield* repository.getById(id)
    return `👋 Bonjour ${user.name}`
  })

// 3. Des implémentations interchangeables
const MockRepository = Layer.succeed(UserRepository, {
  getById: (id) => id === 1
    ? Effect.succeed({ id, name: "Ada (mock)" })
    : Effect.fail(new UserNotFound({ id })),
})

const ApiRepository = Layer.succeed(UserRepository, {
  getById: (id) =>
    Effect.succeed({ id, name: "Grace (API)" }).pipe(Effect.delay("500 millis")),
})

console.log(await Effect.runPromise(greet(1).pipe(Effect.provide(MockRepository))))
console.log(await Effect.runPromise(greet(1).pipe(Effect.provide(ApiRepository))))
```

</div>
</div>

---
zoom: 0.8
---

# En vrai : mock **ou** PostgreSQL

<div class="grid grid-cols-[1fr_1.3fr] gap-8">
<div>

📁 `tutorial04`

- `APP_REPOSITORY=mock` ou `postgres` choisit l'implémentation
- La logique métier (`findUser`) **ne change pas**
- Le `Layer` PostgreSQL ouvre **et ferme** le pool de connexions
- Chaque ligne lue est validée par `UserSchema`

```sh
cp tutorial04/.env.example tutorial04/.env
pnpm start:tutorial04
```

`APP_USER_ID` : `1` valide · `2` rejeté par le schéma · `999` absent

</div>
<div>

```ts
// script.ts : seule la couche fournie change
if (config.repository === "mock") {
  return yield* Effect.provide(
    findUser(config.userId),
    MockUserRepositoryLayer,
  )
}
return yield* Effect.provide(
  findUser(config.userId),
  makePostgresUserRepositoryLayer(config.databaseUrl),
)
```

```ts
// postgres-user-repository.ts (simplifié)
export const makePostgresUserRepositoryLayer = (url: Redacted<string>) =>
  Layer.effect(UserRepository, makePostgresUserRepository).pipe(
    Layer.provide(PgClient.layerFrom(PgClient.make({ url }))),
  )
```

</div>
</div>

<!--
Le repository PostgreSQL exécute `SELECT … WHERE id = ${id}` (requête paramétrée) puis décode la ligne avec UserSchema.
-->

---
layout: section
---

# 8. Aller plus loin
### Regrouper les appels, tester le temps

---
zoom: 0.72
---

# ▶ ⑩ Regrouper les appels : `Request` + `RequestResolver`

<div class="grid grid-cols-[1fr_2.8fr] gap-6">
<div>

### Classique

- 1 000 users = **1 000** `GET /api/users/:id`
- Le même id demandé 2 fois = 2 requêtes
- DataLoader ou cache maison… à brancher partout

### Effect

- Les requêtes concurrentes partent **en un seul appel**
- Le code appelant **ne change pas**
- `withCache` : **dédoublonnage** + cache

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Exit, Request, RequestResolver } from "effect"

type User = { id: number; name: string }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class GetUserById extends Request.Class<{ readonly id: number }, User, UserNotFound> {}

// Le backend sait renvoyer plusieurs users en un seul appel
const fetchUsersBatch = (ids: ReadonlyArray<number>) =>
  Effect.log(`🌐 GET /api/users?ids=${ids.join(",")}`).pipe(
    Effect.as(ids.filter((id) => id !== 404).map((id) => ({ id, name: `User ${id}` }))),
  )

const UserResolver = RequestResolver.make<GetUserById>((entries) =>
  fetchUsersBatch(entries.map((entry) => entry.request.id)).pipe(
    Effect.map((users) => entries.forEach((entry) => {
      const user = users.find((u) => u.id === entry.request.id)
      entry.completeUnsafe(user ? Exit.succeed(user) : Exit.fail(new UserNotFound({ id: entry.request.id })))
    })),
  ),
)

// Le code appelant ne sait rien du regroupement
const getUsers = (resolver: RequestResolver.RequestResolver<GetUserById>) =>
  Effect.forEach([1, 2, 3, 2, 1, 404], (id) =>
    Effect.request(new GetUserById({ id }), resolver).pipe(Effect.result),
    { concurrency: "unbounded" }) // 👉 essayez 2

await Effect.runPromise(Effect.gen(function* () {
  yield* getUsers(UserResolver)
  yield* Effect.log("— avec withCache —")
  const cached = yield* RequestResolver.withCache(UserResolver, { capacity: 100 })
  yield* getUsers(cached)
  yield* getUsers(cached) // tout est en cache : aucun appel
}))
```

</div>
</div>

<!--
Sans cache : un seul appel, mais les ids 1 et 2 partent deux fois. Avec withCache : dédoublonnés, puis plus aucun appel.
La taille d'un lot est bornée par la concurrence : avec concurrency 5, 1 000 users ≈ 200 appels (et non 1 000).
Chaque entrée DOIT être complétée (completeUnsafe), sinon l'appelant reste bloqué.
-->

---
zoom: 0.85
---

# ▶ ⑪ Tester le retry sans attendre : `TestClock`

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

### Classique

- `vi.useFakeTimers()`
- `vi.advanceTimersByTimeAsync(...)`
- Mock de `fetch`
- Et l'ordre promesses / timers à dompter 🤯

### Effect

- Le temps est un **service** : en test, on le remplace
- 7 s de backoff… testées en quelques **ms**
- `it.effect` (`@effect/vitest`) fournit le `TestClock`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Exit, Fiber, Schedule } from "effect"
import { TestClock } from "effect/testing"

class HttpError extends Data.TaggedError("HttpError")<{ status: number }> {}

const test = Effect.gen(function* () {
  let attempts = 0
  const flaky = Effect.suspend(() => {
    attempts++
    return Effect.fail(new HttpError({ status: 503 }))
  })
  const fiber = yield* flaky.pipe(
    // 1 s + 2 s + 4 s = 7 secondes de backoff
    Effect.retry({ schedule: Schedule.exponential("1 second"), times: 3 }),
    Effect.forkChild,
  )
  yield* TestClock.adjust("10 seconds") // ⏩ le temps avance… instantanément
  const exit = yield* Fiber.await(fiber)
  return `${attempts} tentatives, échec final : ${Exit.isFailure(exit)}`
})

const start = Date.now()
const result = await Effect.runPromise(test.pipe(Effect.provide(TestClock.layer())))
console.log(`✅ ${result} — en ${Date.now() - start} ms`)
```

</div>
</div>

<!--
Même principe pour fetch : on fournit un Layer de test (section 7).
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

# 9. En vrai : un serveur Express
### 📁 `tutorial05`

---
layout: two-cols-header
layoutClass: gap-4
---

# Le même serveur, deux fois

::left::

**Express + async/await**

<<< @/../tutorial05/classic-server.ts ts {all}{maxHeight:'350px'}

::right::

**Express + Effect**

<<< @/../tutorial05/effect-server.ts ts {all}{maxHeight:'350px'}

<!--
Même API, mêmes données. Faire défiler : buildSummary classique (try/catch imbriqués) vs Effect.all + Result.
-->

---

# Quatre scénarios à essayer

```sh
pnpm start:tutorial05:classic   # http://localhost:3000
pnpm start:tutorial05:effect    # http://localhost:3001
```

| Requête | Scénario | Classique | Effect |
|---|---|---|---|
| `/users/1/summary` | cas valide | ✅ | ✅ |
| `/users/2/summary` | données invalides | `as User` laisse passer | `Schema` : erreur explicite |
| `/users/4/summary` | timeout (500 ms) | `Promise.race` répond… et continue | `Effect.timeout` interrompt |
| 2 appels puis `/stats` | état partagé | un incrément perdu | `Ref` atomique |

<!--
Démo terminal : lancer les deux serveurs, puis les curl du README.
-->

---

# Le bilan côté serveur

| Problème | Async/await classique | Effect |
|---|---|---|
| Données externes | Cast TypeScript | Validation `Schema` |
| Erreurs possibles | Invisibles dans `Promise<A>` | Canal d'erreur typé |
| Travail concurrent | `Promise.allSettled` + `reason: any` | `Effect.all` + `Result` typé |
| Timeout | Répond sans annuler | Interrompt les fibres enfants |
| État partagé | Mutation manuelle | `Ref` atomique |

---
zoom: 0.85
---

# ▶ État partagé : `let` vs `Ref`

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- Le bug classique : **lire → await → écrire**
- 10 requêtes concurrentes… et des incréments perdus
- `Ref.update` : une fonction **synchrone** et **atomique**, impossible d'y glisser un `await`

📁 `tutorial05` : `GET /stats`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect, Ref } from "effect"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ❌ Classique : lire → await → écrire
let completed = 0
const handleRequest = async () => {
  const current = completed
  await sleep(25) // … une autre requête passe par là
  completed = current + 1
}
await Promise.all(Array.from({ length: 10 }, handleRequest))
console.log(`classique : ${completed} / 10`)

// ✅ Effect : Ref.update est atomique
const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0)
  const handle = Effect.sleep("25 millis").pipe(
    Effect.andThen(Ref.update(counter, (n) => n + 1)),
  )
  yield* Effect.all(Array.from({ length: 10 }, () => handle), { concurrency: "unbounded" })
  return yield* Ref.get(counter)
})
console.log(`Effect : ${await Effect.runPromise(program)} / 10`)
```

</div>
</div>

<!--
Honnêteté : `completed++` juste après l'await marcherait aussi. Le vrai bug, c'est la lecture et l'écriture séparées par un await ; Ref rend ce découpage impossible.
-->

---

# Adopter Effect… à la frontière

Express reste là. Seul le handler appelle `Effect.runPromise` :

```ts
app.get("/users/:id/summary", async (request, response) => {
  const result = await Effect.runPromise(Effect.result(getSummary(request.params.id)))

  if (Result.isSuccess(result)) return response.json(result.success)

  switch (result.failure._tag) { // toutes les erreurs possibles, typées
    case "InvalidRequest": return response.status(400).json({ error: result.failure.message })
    case "UserNotFound": return response.status(404).json({ error: result.failure.message })
    case "InvalidDatabaseData": return response.status(502).json({ error: result.failure.details })
    case "TimeoutError": return response.status(504).json({ error: result.failure.message })
  }
})
```

<v-click>

👉 On peut convertir **un endpoint à la fois** : le reste de l'application ne voit qu'une `Promise`.

</v-click>

<!--
Version simplifiée du handler de tutorial05/effect-server.ts.
-->

---
layout: section
---

# 10. Et maintenant ?

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

# Pour essayer : les tutoriels du repo

| | Sujet | Lancer |
|---|---|---|
| `tutorial01` | `try/catch`, tuples, neverthrow | `pnpm start:tutorial01` |
| `tutorial02` | Premiers pas : créer, composer, lancer | `pnpm start:tutorial02` |
| `tutorial03` | Services, `Schema` et `Config` | `pnpm start:tutorial03` · `pnpm start:tutorial03:config` |
| `tutorial04` | Application complète : mock et PostgreSQL | `pnpm start:tutorial04` |
| `tutorial05` | Express : async/await vs Effect | `pnpm start:tutorial05:classic` · `:effect` |

<br>

Et ces slides : `pnpm slides slides3.md` — chaque démo ▶ est modifiable.

---

# À retenir

<v-clicks>

1. Une `Promise` court déjà, un `Effect` est une **description** : on le rejoue, on l'interrompt, on le teste
2. `Effect<A, E, R>` : un type qui **dit la vérité**
3. Parallélisme, concurrence, interruption, retry : **des options, pas des helpers**
4. Les erreurs sont **typées** et le compilateur vérifie qu'on les traite
5. Les dépendances sont **vérifiées à la compilation**
6. On peut l'adopter **progressivement**, un endpoint à la fois

</v-clicks>

---
layout: center
class: text-center
---

# Merci ! <span class="tech-emoji">🙏</span>

Questions ?

[Ajouter : QR code vers les slides et le repo de démo]

effect.website · [Ajouter : contact]

<!--
Garder 2-3 minutes pour les questions si possible.
-->
