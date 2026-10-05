import { Context, Effect, pipe, Schema } from "effect";

/**
 * Le schéma est partagé par toutes les implémentations du repository.
 * Une ligne provenant du mock ou de PostgreSQL doit respecter le même contrat.
 */
export const UserSchema = Schema.Struct({
    id: Schema.Int.check(Schema.isGreaterThan(0)),
    name: Schema.NonEmptyString,
    email: Schema.NonEmptyString,
});

export type User = typeof UserSchema["Type"];

/**
 * Décode un utilisateur à partir de données inconnues en utilisant le schéma défini ci-dessus.
 */
export const decodeUser = Schema.decodeUnknownEffect(UserSchema);


export class UserNotFound extends Error {
    readonly _tag = "UserNotFound";
    readonly id: number;

    constructor(id: number) {
        super(`Utilisateur ${id} introuvable`);
        this.id = id;
    }
}

export class InvalidUserData extends Error {
    readonly _tag = "InvalidUserData";
    readonly id: number;
    readonly details: string;

    constructor(
        id: number,
        details: string,
    ) {
        super(`Données invalides pour l'utilisateur ${id}`);
        this.id = id;
        this.details = details;
    }
}

export class DatabaseError extends Error {
    readonly _tag = "DatabaseError";
    readonly details: string;

    constructor(details: string) {
        super(details);
        this.details = details;
    }
}

export const makeUserNotFound = (id: number): UserNotFound =>
    new UserNotFound(id);

export const makeInvalidUserData = (
    id: number,
    details: string,
): InvalidUserData => new InvalidUserData(id, details);

export const makeDatabaseError = (details: string): DatabaseError =>
    new DatabaseError(details);

export type UserRepositoryError =
    | UserNotFound
    | InvalidUserData
    | DatabaseError;

/**
 * Description du service de repository des utilisateurs.
 */
export interface UserRepositoryService {
    readonly getById: (
        id: number,
    ) => Effect.Effect<User, UserRepositoryError>;
}

/**
 * Ajout du service de repository des utilisateurs au contexte.
 */
export const UserRepository = Context.Service<UserRepositoryService>(
    "UserRepository",
);
