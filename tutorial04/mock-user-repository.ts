import { Console, Effect, Layer } from "effect";
import {
    decodeUser,
    makeInvalidUserData,
    makeUserNotFound,
    UserRepository,
    type UserRepositoryService,
} from "./user-repository.ts";

/**
 * Le mock contient des unknown, comme une vraie source externe.
 * Cela oblige le repository à valider ses résultats avec UserSchema.
 */
const mockRows = new Map<number, unknown>([
    [1, { id: 1, name: "Ada Lovelace", email: "ada@example.com" }],
    [2, { id: "2", name: "", email: null }],
]);

const userService: UserRepositoryService = {
    getById: (id) =>
        Effect.gen(function* () {
            yield* Console.log(
                `[database mock] Recherche de l'utilisateur ${id}`,
            );

            const row = mockRows.get(id);

            if (row === undefined) {
                return yield* Effect.fail(makeUserNotFound(id));
            }

            return yield* decodeUser(row).pipe(
                Effect.mapError((error) =>
                    makeInvalidUserData(id, error.message)
                ),
            );
        }),
};

/**
 * Fournit une implémentation mock du service UserRepository.
 * Un Layer est une recette qui explique comment fournir une implémentation d'un service.
 * Dans notre cas, le Layer fournit simplement l'implémentation mock définie ci-dessus.
 */
export const MockUserRepositoryLayer = Layer.succeed(
    UserRepository,
    userService,
);

