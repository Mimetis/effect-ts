import {
    Config,
    ConfigProvider,
    Console,
    Effect,
    Schema,
    String as EffectString,
} from "effect";

/**
 * Un type TypeScript disparaît à l'exécution. Un Schema reste disponible pour
 * valider les données externes et les transformer en valeurs sûres.
 */
const AppConfigSchema = Schema.Struct({
    name: Schema.NonEmptyString,
    port: Schema.Int.check(
        Schema.isBetween({ minimum: 3000, maximum: 9999 }),
    ),
    apiUrl: Schema.URL,
    apiKey: Schema.Redacted(Schema.NonEmptyString),
});

type AppConfig = typeof AppConfigSchema["Type"];

// Config lit les valeurs externes et Schema les valide.
const appConfig: Config.Config<AppConfig> = Config.schema(AppConfigSchema, "app");

// Provider d'environnement de base, sans transformation des segments.
const envProviderBase = ConfigProvider.fromEnv();

/**
 * Config demande par exemple le chemin logique ["app", "apiUrl"].
 *
 * mapInput reçoit ce chemin complet, puis transforme chaque segment :
 * - "app" devient "APP" ;
 * - "apiUrl" devient "API_URL".
 *
 * Le provider d'environnement joint ensuite les segments avec "_".
 * Le chemin ["APP", "API_URL"] correspond donc à la variable APP_API_URL.
 *
 * Les segments numériques sont conservés pour permettre la lecture de tableaux.
 */
const envProviderBaseCase = envProviderBase.mapInput((path) =>
    path.map((segment) =>
        typeof segment === "number"
            ? segment
            : EffectString.configCase(segment)
    )
);


// version simplifiée
const envProvider = ConfigProvider.fromEnv().pipe(
    // app.apiUrl devient APP_API_URL dans le fichier .env.
    ConfigProvider.constantCase,
);


// Le type d'erreur ConfigError est conservé par Effect jusqu'à son traitement.
const program: Effect.Effect<void, Config.ConfigError> = Effect.gen(function* () {
    const config = yield* appConfig;

    yield* Console.log("Configuration valide :");
    yield* Console.log(`- application : ${config.name}`);
    yield* Console.log(`- port        : ${config.port}`);
    yield* Console.log(`- API         : ${config.apiUrl.href}`);
    yield* Console.log("- clé API     :", config.apiKey);
});


const exitCode = await Effect.runPromise(
    program.pipe(
        // Fournit à Config le provider détaillé ci-dessus.
        Effect.provideService(ConfigProvider.ConfigProvider, envProvider),
        Effect.matchEffect({
            onSuccess: () => Effect.succeed(0),
            onFailure: (error) =>
                Console.error(`Configuration invalide :\n${error.message}`).pipe(
                    Effect.map(() => 1),
                ),
        }),
    ),
);

process.exitCode = exitCode;
