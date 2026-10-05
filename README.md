
# Error Handling

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

## Tutorial 03 - Effect Schema et Config

L'exemple `tutorial03/config.ts` suit un flux simple :

1. Node charge le fichier `.env` grâce à son option native `--env-file` ;
2. **Config** lit les variables d'environnement ;
3. **Schema** valide les valeurs et déduit leur type TypeScript ;
4. **Effect** conserve l'éventuelle `ConfigError` dans son canal d'erreur.

Aucune dépendance comme `dotenv` n'est nécessaire. Le schéma transforme aussi
l'URL en objet `URL` et protège la clé API avec `Redacted`.

Créer le fichier local de configuration :

```sh
cp tutorial03/.env.example tutorial03/.env
```

Puis exécuter l'exemple :

```sh
pnpm start:tutorial03:config
```

Pour observer une erreur de validation, remplacer par exemple le port dans
`tutorial03/.env` :

```dotenv
APP_PORT=70000
```

## Tutorial 04 - Application complète

Ce dernier tutoriel fusionne les notions précédentes dans un seul programme :

1. `Config` charge l'identifiant demandé et l'URL de la base depuis `.env` ;
2. `AppConfigSchema` valide cette configuration ;
3. `UserSchema` décrit et valide les utilisateurs retournés par la base ;
4. `UserRepository` sépare la logique métier de la base de données ;
5. `mock-user-repository.ts` fournit une implémentation en mémoire ;
6. `postgres-user-repository.ts` utilise le driver officiel `@effect/sql-pg`
   et une requête SQL paramétrée ;
7. Effect compose les erreurs de configuration, d'utilisateur absent et de
   données invalides.

Préparer puis exécuter l'exemple :

```sh
cp tutorial04/.env.example tutorial04/.env
pnpm start:tutorial04
```

Modifier `APP_USER_ID` dans `tutorial04/.env` pour observer les différents cas :

- `1` : utilisateur valide ;
- `2` : ligne trouvée, mais rejetée par `UserSchema` ;
- `999` : utilisateur absent de la base mockée.

Le fichier `.env.example` utilise le repository mocké par défaut :

```dotenv
APP_REPOSITORY=mock
```

Pour utiliser une vraie base PostgreSQL, créer la base et la table d'exemple :

```sh
createdb effect_tutorial
psql effect_tutorial -f tutorial04/schema.sql
```

Puis modifier `tutorial04/.env` :

```dotenv
APP_REPOSITORY=postgres
APP_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/effect_tutorial
```

La logique métier dans `script.ts` reste identique : seule la couche
`UserRepository` fournie à Effect change.