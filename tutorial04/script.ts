import {
    Config,
    ConfigProvider,
    Console,
    Effect,
    Result,
    Schema,
} from "effect";
import { MockUserRepositoryLayer } from "./mock-user-repository.ts";
import { makePostgresUserRepositoryLayer } from "./postgres-user-repository.ts";
import { UserRepository } from "./user-repository.ts";

/**
 * La configuration choisit l'implémentation sans changer la logique métier.
 * L'URL est Redacted car elle peut contenir un nom d'utilisateur et un mot de
 * passe PostgreSQL.
 */
const AppConfigSchema = Schema.Struct({
    userId: Schema.Int.check(Schema.isGreaterThan(0)),
    repository: Schema.Literals(["mock", "postgres"]),
    databaseUrl: Schema.Redacted(Schema.NonEmptyString),
});

type AppConfig = typeof AppConfigSchema["Type"];


const appConfig: Config.Config<AppConfig> = Config.schema(AppConfigSchema,"app");

/**
 * La logique métier dépend uniquement du contrat UserRepository.
 */
const findUser = (id: number) =>

    Effect.gen(function* () {
        /// Récupère le service UserRepository à partir de l'environnement.
        const repository = yield* UserRepository;

        /// Appelle la méthode getById du service UserRepository.
        return yield* repository.getById(id);
    });


const findUserImplementation = Effect.gen(function* () {
    const config = yield* appConfig;

    if (config.repository === "mock") {
        return yield* Effect.provide(
            findUser(config.userId),
            MockUserRepositoryLayer,
        );
    }

    return yield* Effect.provide(
        findUser(config.userId),
        makePostgresUserRepositoryLayer(config.databaseUrl),
    );
});



/**
 * Fournit la configuration de l'application à partir des variables d'environnement.
 */
const envProvider = ConfigProvider.constantCase(ConfigProvider.fromEnv());


const main = Effect.gen(function* () {
    const result = yield* Effect.result(findUserImplementation);

    if (Result.isSuccess(result)) {
        const user = result.success;
        yield* Console.log(
            `Utilisateur trouvé : ${user.name} <${user.email}>`,
        );
        return;
    }

    const error = result.failure;

    switch (error._tag) {
        case "ConfigError":
            yield* Console.error(
                `Configuration invalide :\n${error.message}`,
            );
            break;
        case "UserNotFound":
            yield* Console.error(
                `Utilisateur ${error.id} introuvable`,
            );
            break;
        case "InvalidUserData":
            yield* Console.error(
                `Données invalides pour l'utilisateur ${error.id} :\n${error.details}`,
            );
            break;
        case "DatabaseError":
            yield* Console.error(
                `Erreur PostgreSQL :\n${error.details}`,
            );
            break;
    }
});

await Effect.runPromise(
    Effect.provideService(
        main,
        ConfigProvider.ConfigProvider,
        envProvider,
    ),
);
