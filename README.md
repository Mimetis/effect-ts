# Effect 4 : du TypeScript qui ne ment plus

Une présentation [Slidev](https://sli.dev) pour faire découvrir [Effect](https://effect.website) à des développeurs TypeScript qui ne le connaissent pas.

> Sébastien Pertus · DevFest Toulouse 2026 · `effect` 4.0

Le deck est [slides/slides.md](./slides/slides.md) : 43 slides, **le talk** (slides 1 à 23 : un tutorial en 8 étapes, puis l'écosystème et quand adopter Effect) suivi de **20 slides bonus pour approfondir** (slides 24 à 43), non présentées en live mais laissées dans le deck pour ceux qui le récupèrent. Il contient **19 démos exécutables** (marquées ▶) qu'on lance et qu'on modifie directement depuis la slide. Après la présentation de l'orateur, un mur de tweets (« Ils en parlent ») montre ce qu'en disent Matt Pocock, ThePrimeagen, Theo, Rhys Sullivan et d'autres. Une slide « titre » affiche ensuite un grand `Effect<A, E, R>` qui résume toute la présentation : `A` (le succès, validé avec `Schema` et `Config`), `E` (les erreurs typées, `catchTag`, `retry`, `timeout`) et `R` (les dépendances, injectées avec `Layer`). Une slide présente ensuite `Effect<A, E, R>` : les mêmes fonctions déclarées en `Promise` puis en `Effect`, pour comparer leurs types de retour, et un premier Effect à exécuter (`succeed`, `fail`, `divide`). Vient ensuite le tutorial.

## Lancer la présentation

```sh
pnpm install
pnpm slides          # serveur de dev, ouvre le navigateur
pnpm slides:build    # site statique dans slides/dist
pnpm slides:export   # export PDF (nécessite playwright-chromium)
```

En présentation :

- `→` / `←` pour avancer et reculer, `o` pour la vue d'ensemble, `g` pour aller à une slide ;
- le mode présentateur (avec les notes) s'ouvre depuis la barre de navigation, ou à l'adresse `/presenter` ;
- le bouton en haut à droite, ou la touche `d`, bascule entre mode clair et mode sombre ;
- sur une slide ▶, le bouton ▷ exécute le code.

## Pourquoi ce talk ?

La gestion des erreurs n'a jamais été vraiment résolue : codes d'erreur qu'on oublie de vérifier, exceptions invisibles dans les signatures, checked exceptions qui finissent en `catch (e) {}`, `Result` qu'il faut tout brancher à la main…

Deux constats guident le talk :

1. **Tout système qui repose sur la discipline des développeurs échoue** : des erreurs seront oubliées. Il faut que ce soit le compilateur qui vérifie.
2. **Toutes les erreurs ne se valent pas** : certaines se rattrapent, d'autres non, et ça dépend du projet. Il faut pouvoir choisir lesquelles traiter.

Effect répond aux deux : les erreurs sont dans le type, et on choisit lesquelles traiter. En plus, il fournit tout ce qui manque à une `Promise` : concurrence, annulation, retry, timeout, injection de dépendances, validation.

## Le fil rouge

Un même exemple traverse tout le deck : une fonction `getUser` qui récupère un utilisateur.

- d'abord dans un tutorial : un `getUser` qui lit la réponse (`unknown`) d'une API, migré vers Effect en 8 étapes, un concept par étape ;
- puis, dans les bonus : en `try / catch`, avec des tuples `[data, error]`, puis avec un `Result` (neverthrow) ;
- enfin, toujours dans les bonus, dans un cas réaliste qui grandit étape par étape, écrit une fois en TypeScript classique et une fois avec Effect.

## Ce qu'on va voir

### Les erreurs : un éternel recommencement (slide 5)

Une frise qui montre comment chaque approche (codes d'erreur, exceptions, checked exceptions, `Result`) corrige le défaut de la précédente… et en crée un nouveau.

### Le tutorial : `getUser`, pas à pas (slides 7 à 17)

On part d'un `getUser` qui cherche un utilisateur dans ce que renvoie une API : un tableau de `User` à l'étape 1, puis un `Record<number, unknown>` dont une entrée est invalide. Chaque slide ajoute **un seul concept** (lignes marquées 🆕), et un bandeau rappelle ce que renvoie `getUser` (`A`, `E`, `R`) après l'étape.

1. ▶ **`Effect.succeed`** : l'API renvoie un tableau de `User` valides, et `getUser` met le résultat de `api.find(…)` dans un Effect. `Effect<User | undefined, never, never>` : `A` dit la vérité, l'utilisateur peut ne pas exister (là où `Promise<User>` et son `as User` promettent un `User`). `runSync` l'exécute.
2. ▶ **`Effect.fail`** : un utilisateur absent devient un `UserNotFound` (`Data.TaggedError`), visible dans la signature `Effect<unknown, UserNotFound>`. Rien n'est levé : `runSyncExit` renvoie `Success` ou `Failure`, une valeur. On ne traite pas encore l'erreur.
   - ▶ **Et avec `try / catch` ?** Le même `getUser` en `async` / `try / catch` : `Promise<User>` ne dit rien des erreurs, `e` est `unknown`, le `catch` attrape aussi les bugs (le `TypeError` d'Ada, à cause du `as User`), et un objet jeté tel quel donne « Error: [object Object] ».
3. ▶ **L'erreur est un type : `catchTag`** : chaque problème du `try / catch` et sa correction par le type (un clic par point). `Effect.catchTag(effect, "UserNotFound", …)` traite l'erreur par son nom, sans `pipe` ; `e` est typé, les bugs ne sont pas attrapés, et `E` redevient `never`.
4. ▶ **`Schema`** : `Schema.decodeUnknownEffect` remplace `Effect.succeed`. `A` devient `User` (type déduit du schéma), `SchemaError` rejoint `E` avec le chemin du champ fautif, et `catchTags` traite chaque erreur.
5. ▶ **`pipe` et `map`** : la version imbriquée `catchTags(map(getUser(id), …), …)` comparée à `getUser(id).pipe(map, catchTags)`, qui se lit de haut en bas. `showUser` renvoie `Effect<string, never>`.
   - **Intermède « `function*` et `yield*` : pas de panique »** (slide 13) : avant l'étape 6, elle annonce qu'on quitte `pipe` / `flatMap` / `map` pour `Effect.gen`, et rassure sur la syntaxe : la même fonction en `async / await` et en `Effect.gen`, côte à côte, puis un mémo de migration (`.pipe` / `async function` → `Effect.gen(function* ()`, `flatMap` / `await` → `yield*`, `map` → `return`, `fail` / `throw` → `return yield*`). Aucune connaissance des générateurs n'est requise.
6. ▶ **`Effect.gen`** : quand l'appel à l'API est un Effect, il faut attendre sa réponse avant de la tester. Le même `getUser` en `pipe` (avec `filterOrFail`) et en `gen` (un simple `if`, `yield*` ≈ `await`) ; la signature est inférée.
7. ▶ **`tryPromise`, `timeout` et `retry`** : l'API devient distante et capricieuse. Deux lignes dans le `pipe`, et les tentatives s'affichent ; `runSync` devient `runPromise`.
8. ▶ **`Context.Service` et `Layer`** : l'API devient un contrat, `R = UserApi`. L'implémentation en mémoire, c'est le `Effect.succeed` de l'étape 1. Bonus : `Effect.forEach` avec `{ concurrency: 2 }`.

Le tutorial se termine par **Classique vs Effect** (slide 17) : le tableau récapitulatif de tout le fil rouge, de `async / await` aux dépendances.

### Et maintenant ? (slides 18 à 23)

- **L'écosystème** : depuis Effect 4, un seul paquet `effect` (HTTP, SQL, RPC, CLI inclus), plus les implémentations par plateforme et les drivers de base de données.
- **Et côté frontend ?** [Foldkit](https://foldkit.dev), un framework frontend construit sur Effect, architecturé comme Elm.
- **Effect 🤝 les agents IA** : pourquoi un code Effect est plus facile à écrire et à vérifier pour un agent (un style unique, des erreurs et des dépendances dans le type, tout est intégré, la doc livrée dans le paquet `effect`), et le skill officiel [Effect-TS/skills](https://www.skills.sh/effect-ts/skills/effect-ts) (`npx skills add Effect-TS/skills`).
- **Quand l'adopter (avec honnêteté)** : dans quels cas ça vaut le coup, dans quels cas non, l'adoption progressive avec `Effect.runPromise`, et les perspectives d'emploi (IA et LLM, fintech, outils pour développeurs).
- **Merci !** : liens utiles, comptes à suivre sur X, et un QR code vers ce dépôt.

## 📚 Bonus : pour approfondir (slides 24 à 43)

Ces slides ne sont **pas présentées en live** : elles restent dans le deck pour ceux qui le récupèrent. La slide 24 en donne le sommaire cliquable, et chaque slide bonus porte un badge « 📚 bonus · pour approfondir » dans sa barre d'état. Les chapitres bonus sont numérotés à part (« Bonus 01 / 05 »). La slide 43 clôt les bonus.

### Bonus 1. Les erreurs avant Effect (slides 25 à 28)

- ▶ **La signature ment** : `Promise<User>` ne dit rien des erreurs, on peut `throw` n'importe quoi, et dans le `catch`, `e` est `unknown`.
- **Les tuples `[data, error]`** : un helper `catchErrorTyped`, mais il faut déclarer les erreurs à chaque appel.
- ▶ **Un `Result` avec neverthrow** : l'erreur entre enfin dans le type… mais concurrence, annulation, retry et dépendances restent à écrire soi-même.

### Bonus 2. Un `getUser` réaliste (slides 29 à 32)

Une liste de besoins réalistes : récupérer un utilisateur et ses commandes en parallèle, pour N utilisateurs mais 5 à la fois, en pouvant tout annuler, avec des retries, une vraie gestion d'erreurs, un timeout, de la validation…

Un magic-move fait évoluer le code TypeScript classique en 8 étapes : `Promise.all`, un helper `mapWithConcurrency`, un `AbortSignal` propagé partout, un `retry` avec un `sleep` annulable, des `instanceof`… Le bilan : trois helpers maison, et une signature qui dit toujours `Promise<UserWithOrders[]>`.

Puis le même chemin avec Effect :

- Les mêmes 8 étapes avec Effect. Chaque besoin devient **une option ou une fonction**, pas un helper : `{ concurrency: 5 }`, `Effect.retry` avec un `Schedule`, `Effect.timeout`, `Effect.withSpan` pour les traces. La signature finale liste toutes les erreurs possibles.
- Pourquoi `Effect.all` plutôt que `Promise.all` ou `Promise.allSettled` : les erreurs restent typées, les branches restantes sont interrompues, et `{ mode: "result" }` fait un `allSettled` typé.
- ▶ **La requête zombie** : côte à côte, `Promise.all` rejette mais laisse tourner la requête sœur, alors qu'`Effect.all` l'annule réellement.

### Bonus 3. Valider ce qui vient de l'extérieur (slides 33 à 35)

- ▶ **`Schema`** : avec `as User`, on fait confiance au backend ; avec zod ou valibot, `parse` lève une exception et `safeParse` est à tester à la main. Avec Effect, une ligne (`Schema.decodeUnknownEffect`) suffit pour que `SchemaError` rejoigne le type de `getUser`, avec le chemin exact du champ fautif.
- ▶ **`Config`** : un `.env` simulé, validé au démarrage par un `Schema`, avec `constantCase` (`app.apiUrl` → `APP_API_URL`) et `Redacted` pour que la clé d'API n'apparaisse jamais dans les logs.

### Bonus 4. Services & Layers (slides 36 à 38)

- ▶ **Changer d'implémentation sans toucher au métier** : un contrat (`Context.Service`), une logique métier qui ne connaît que lui, et un `Layer` qui fournit l'implémentation. La dépendance apparaît dans `R` : oublier de la fournir est une **erreur de compilation**, pas un `Service not found` à l'exécution.
- ▶ **Le même service, écrit comme une classe** : `class UserRepository extends Context.Service<UserRepository, { … }>()("…")`, la forme qu'on écrit dans un vrai projet. La classe porte à la fois le contrat et la clé, l'implémentation est rangée en `static` (`UserRepository.api`), et `R` affiche le nom de la classe.

### Bonus 5. Patterns avancés (slides 39 à 42)

- ▶ **Regrouper les appels** avec `Request` et `RequestResolver` : les requêtes concurrentes partent en un seul appel, et `withCache` les dédoublonne.
- ▶ **Tester le retry sans attendre** avec `TestClock` : 7 secondes de backoff testées en quelques millisecondes.
- ▶ **État partagé : `let` vs `Ref`** : 10 requêtes concurrentes, des incréments perdus avec une variable classique, aucun avec `Ref.update`.

## Les démos exécutables ▶

Les démos tournent **dans le navigateur**, sans réseau ni terminal : on peut modifier le code pendant la présentation et le relancer.

- Les types d'Effect sont chargés dans l'éditeur : on peut **survoler** une variable pour voir son type, et les erreurs de compilation sont **soulignées en rouge** dès qu'on modifie le code.
- Les logs d'Effect (`Effect.log`, `Console.log`) et les erreurs typées s'affichent proprement sous l'éditeur.
- La première slide ▶ met quelques secondes à charger les types d'Effect ; les suivantes sont immédiates.

## Organisation du dépôt

| Fichier | Rôle |
|---|---|
| [slides/slides.md](./slides/slides.md) | Le deck |
| [slides/setup/code-runners.ts](./slides/setup/code-runners.ts) | Affiche les logs Effect et formate les erreurs sous les démos ▶ |
| [slides/setup/monaco.ts](./slides/setup/monaco.ts) | Charge les types d'Effect 4 dans les éditeurs live |
| [slides/setup/shiki.ts](./slides/setup/shiki.ts) | Thème de coloration du code |
| [slides/setup/main.ts](./slides/setup/main.ts) | Rend le focus aux slides après un clic, pour que les flèches continuent de fonctionner |
| [slides/global-top.vue](./slides/global-top.vue) | Bouton clair / sombre |
| [slides/slide-bottom.vue](./slides/slide-bottom.vue) | Fond commun à tous les slides (dégradés + grille) et barre d'état (numéro de slide, badge « bonus ») |
| [slides/layouts/section.vue](./slides/layouts/section.vue) | Layout des slides de chapitre (`layout: section`) : numéro et progression calculés automatiquement, séparément pour le talk et pour les bonus |
| [slides/composables/useBonus.ts](./slides/composables/useBonus.ts) | Repère les slides bonus : toutes celles qui suivent la première slide marquée `bonus: true` dans son frontmatter |
| [slides/style.css](./slides/style.css) | Polices et styles partagés |
| [slides/images/](./slides/images) | Photo, logos et QR code |
| [backend/](./backend) | Petite app Next.js 16 (App Router) dont le backend utilise Effect : `pnpm backend` (dev), `pnpm backend:build` |
| [.github/skills/effect/](./.github/skills/effect/SKILL.md) | Le skill d'agent (Copilot) dédié à Effect 4 : conventions, pièges de la v4, migration depuis async/await, avec des références par thème |

## Pour aller plus loin

- [effect.website/docs](https://effect.website/docs/) : la documentation officielle
- [github.com/Effect-TS/effect](https://github.com/Effect-TS/effect) : le code source
- [discord.gg/effect-ts](https://discord.gg/effect-ts) : la communauté
- [effect.website/effect-jobs](https://effect.website/effect-jobs) : les offres d'emploi

<details>
<summary>Le texte d'origine : <em>Error Handling</em></summary>

Error handling has been wrong since the beginning, and has continued to be wrong ever since.

First, we had error codes. Except these were wrong because people forget all the time to check them.

Then we had exceptions, which solved the problem of people forgetting to check by crashing the app.

Then the Java team got the bright idea to have checked exceptions, which at first helped to mitigate crashes
from uncaught exception, but caused an explosion in thrown exception signatures, culminating in "catch Throwable".

Back to square one.

Then we got multi-return error objects, maybes, panics, and all sorts of bright ideas that fail to understand the basic premises of errors:

  Any error system that relies upon developer discipline will fail because errors will be missed.

  Any error system that handles all errors the same way will fail because there are some errors we can ignore,
  and some errors we must not ignore. And what's ignorable/retriable to one project is not ignorable/retriable to another.

Attempting to get the complete set of error types that any given call may raise is a fool's errand because of the halting
problem it eventually invokes. Forcing people to provide such a list results in the Java problem for the same reason.

It's a hard problem, which is why no one has solved it yet.

</details>
