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

Une petite API comme dans un vrai projet, écrite en async/await, que l'on migrera ensuite vers Effect. Toute la logique d'un endpoint est dans son `route.ts`, pour qu'on la voie d'un coup d'œil.

| Fichier | Rôle |
|---|---|
| [app/api/users/route.ts](./app/api/users/route.ts) | `GET /api/users` : lit les utilisateurs (avec retry), les valide avec zod, et traduit chaque erreur en code HTTP (503, 500) |
| [app/api/users/[id]/route.ts](./app/api/users/[id]/route.ts) | `GET /api/users/:id` : valide l'id, charge l'utilisateur et ses commandes en parallèle (`Promise.all`), et gère ses propres erreurs : 400 id invalide, 404 introuvable, 503 base indisponible, 500 donnée invalide (utilisateur ou commandes) |
| [lib/db.ts](./lib/db.ts) | Une base de données simulée : chaque requête prend du temps, et la connexion tombe 1 fois sur 5 (`DatabaseError`) |
| [lib/retry.ts](./lib/retry.ts) | Le helper `retry` maison, avec backoff exponentiel |
| [lib/schemas.ts](./lib/schemas.ts) | Les schémas zod `UserSchema` et `OrderSchema`, et les types qui en sont déduits, partagés avec la page (`User`, `Order`, `UserWithOrders`) |
| [app/page.tsx](./app/page.tsx) | La page : la liste, le détail d'un utilisateur au clic, et deux liens pour provoquer les erreurs |

## Pour les agents

- [AGENTS.md](./AGENTS.md) : consignes Next.js 16 (générées par Next.js) ; la doc de la version installée est dans `node_modules/next/dist/docs/`.
- Les skills du projet, dont celui dédié à Effect, sont à la racine du dépôt, dans [.github/skills/](../.github/skills).
