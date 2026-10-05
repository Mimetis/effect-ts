import { PgClient } from "@effect/sql-pg";
import { Effect, Layer, Schema } from "effect";
import type { Redacted } from "effect/Redacted";
import { SqlClient, SqlError } from "effect/sql";
import {
    decodeUser,
    makeDatabaseError,
    makeInvalidUserData,
    makeUserNotFound,
    UserRepository,
    type UserRepositoryService,
} from "./user-repository.ts";

type UserRow = Record<string, unknown>;



/**
 * Creates a UserRepositoryService implementation backed by a PostgreSQL database.
 * @param sql The SQL client used to interact with the PostgreSQL database.
 * @returns An implementation of the UserRepositoryService interface using the provided SQL client.
 */
const getSqlUserService = (sql: SqlClient.SqlClient): UserRepositoryService => ({
    getById: (id: number) =>
        Effect.gen(function* () {

            const query: Effect.Effect<ReadonlyArray<UserRow>, SqlError.SqlError> =
                sql<UserRow>`SELECT id, name, email FROM users WHERE id = ${id}`;

            const rows = yield* query.pipe(
                Effect.mapError((error: SqlError.SqlError) => makeDatabaseError(error.message)),
            );

            const row = rows[0];

            if (row === undefined)
                return yield* Effect.fail(makeUserNotFound(id));

            return yield* decodeUser(row).pipe(
                Effect.mapError((error: Schema.SchemaError) =>
                    makeInvalidUserData(id, error.message)
                ),
            );
        }),
});

/**
 * Le cœur du repository suit trois étapes :
 * 1. exécuter la requête ;
 * 2. vérifier qu'une ligne existe ;
 * 3. valider la ligne avec UserSchema.
 */
const makePostgresUserRepository = SqlClient.SqlClient.pipe(
    Effect.map((sql: SqlClient.SqlClient) => getSqlUserService(sql)),
);

/**
 * Cette partie technique branche le repository sur le pool PostgreSQL.
 * Effect ouvrira et fermera automatiquement le pool avec la Layer.
 */
export const makePostgresUserRepositoryLayer = (
    databaseUrl: Redacted<string>,
) => {
    const PostgresClientLayer = PgClient.layerFrom(
        PgClient.make({ url: databaseUrl }).pipe(
            Effect.mapError((error: SqlError.SqlError) =>
                makeDatabaseError(error.message)
            ),
        ),
    );

    return Layer.effect(
        UserRepository,
        makePostgresUserRepository,
    ).pipe(
        Layer.provide(PostgresClientLayer),
    );
};
