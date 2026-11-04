# backend

Petite application [Next.js](https://nextjs.org) 16 (App Router) dont le backend (route handlers, server actions) est écrit avec [Effect](https://effect.website) 4.

Créée avec `create-next-app` (TypeScript, Tailwind CSS 4, ESLint), elle fait partie du workspace pnpm du dépôt.

## Commandes

Depuis la racine du dépôt :

```sh
pnpm install          # une fois, pour tout le workspace
pnpm backend          # serveur de dev sur http://localhost:3000
pnpm backend:build    # build de production
```

Depuis `backend/` :

```sh
pnpm dev              # serveur de dev
pnpm build            # build de production
pnpm lint             # ESLint (config Next.js)
pnpm typecheck        # génère les types des routes (next typegen) puis lance tsc
```

## Le code

La même petite API, écrite deux fois pour comparer : une version async/await, comme dans un vrai projet, et une version Effect 4. Les deux renvoient les mêmes réponses (mêmes JSON, mêmes codes HTTP) et utilisent la même base simulée. Toute la logique d'un endpoint est dans son `route.ts`, pour qu'on la voie d'un coup d'œil.

| | async / await | Effect 4 |
|---|---|---|
| Page | [`/`](./app/page.tsx) | [`/effect`](./app/effect/page.tsx) |
| Liste | [`GET /api/users`](./app/api/users/route.ts) | [`GET /api/users-effect`](./app/api/users-effect/route.ts) |
| Un utilisateur et ses commandes | [`GET /api/users/:id`](./app/api/users/[id]/route.ts) | [`GET /api/users-effect/:id`](./app/api/users-effect/[id]/route.ts) |
| Accès à la base | [`db`](./lib/db.ts), utilisé directement | le service [`Database`](./lib/effect/database.ts) (`Context.Service` + `Layer`), qui enveloppe `db` |
| Retry | le helper maison [`retry`](./lib/retry.ts) | `Effect.retry` + `Schedule.exponential` |
| Validation | zod ([`lib/schemas.ts`](./lib/schemas.ts)) | `Schema` ([`lib/effect/schemas.ts`](./lib/effect/schemas.ts)) |
| Parallélisme | `Promise.all` | `Effect.all` (l'autre requête est interrompue si l'une échoue) |
| Erreurs | des classes `Error`, et un `catch (error: unknown)` avec une chaîne d'`instanceof` | des `Schema.TaggedError` dans le type, et un `Effect.catchTags` vérifié par le compilateur |

Chaque endpoint gère ses propres erreurs : 400 id invalide, 404 utilisateur introuvable, 503 base indisponible après les retries, 500 donnée invalide (utilisateur ou commandes). [lib/db.ts](./lib/db.ts) simule une base dont chaque requête prend du temps et dont la connexion tombe 1 fois sur 5.

## Pour les agents

- [AGENTS.md](./AGENTS.md) : consignes Next.js 16 (générées par Next.js ; la doc de la version installée est dans `node_modules/next/dist/docs/`), et le renvoi vers le skill Effect.
- Les skills du projet, dont celui dédié à Effect, sont à la racine du dépôt, dans [.github/skills/](../.github/skills).
