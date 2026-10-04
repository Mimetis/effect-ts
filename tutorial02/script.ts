import { exit } from "process";
import { Effect, pipe, Console, Data } from "effect";

type Order = { id: number };
type User = { id: number; name: string, country?: string };

// read the user ID from the command line arguments
const id = Number(process.argv[2] ?? 1);


/**
 * Wait for the specified number of milliseconds.
 * @param ms The number of milliseconds to wait.
 */
function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// class UserInvalidUserId extends Error {
//     readonly name = "UserInvalidUserId";
//     readonly tag = "Error_UserInvalidUserId";
// }

// class UserNotFound extends Error {
//     readonly name = "UserNotFound";
//     readonly tag = "Error_UserNotFound";
// }

// class UserCountryNotFound extends Error {
//     readonly name = "UserCountryNotFound";
//     readonly tag = "Error_UserCountryNotFound";
// }

// class UserFromToulouseIsInvalid extends Error {
//     readonly name = "UserFromToulouseIsInvalid";
//     readonly tag = "Error_UserFromToulouseIsInvalid";
// }

class UserInvalidUserId extends Data.TaggedError("UserInvalidUserId")<{ id: number }> { }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> { }
class UserCountryNotFound extends Data.TaggedError("UserCountryNotFound")<{ id: number }> { }
class UserFromToulouseIsInvalid extends Data.TaggedError("UserFromToulouseIsInvalid")<{ id: number }> { }

/**
 * Retrieve a user by their ID.
 * @param id The ID of the user to retrieve.    
 * @returns A promise that resolves to the user object containing the ID and name.
 */
async function getUser(id: number): Promise<User> {
    await wait(1000); // Simulate an asynchronous operation

    if (id <= 0) {
        throw new UserInvalidUserId({ id });
    }

    if (id > 100) {
        throw new UserNotFound({ id });
    }

    return { id, name: `User ${id}` };
}





// Effect’s major unique insight is that we can use the type system to track errors and context,
// not only success values

const getUserEffect = (id: number): Effect.Effect<User, UserInvalidUserId | UserNotFound> => {

    if (id > 500) {
        return Effect.fail(new UserNotFound({ id }));
    }

    if (id > 0) {
        return Effect.succeed({ id, name: `User ${id}` });
    }

    return Effect.fail(new UserInvalidUserId({ id }));
}

const getUserCountryEffect = (user: User): Effect.Effect<User, UserCountryNotFound> => {
    if (user.id > 50) {
        return Effect.succeed({ country: "France", ...user });
    }
    if (user.id > 0) {
        return Effect.succeed({ country: "Belgium", ...user });
    }
    return Effect.fail(new UserCountryNotFound({ id }));
};

// Remember map
// const test = ["a", "b"];
// const test2 = test.map((item) => item.toUpperCase());

// const capitalUserEffect = Effect.map(getUserEffect(id), (user) => ({ ...user, name: user.name.toUpperCase() }));


// on va composer nos effets pour obtenir un utilisateur complet avec son pays
// et on retrouve toutes les erreurs possibles dans le type de l'effet complet résultant
// const completeUserEffect = Effect.flatMap(getUserEffect(id), (user) => getUserCountryEffect(user));


// const getAsyncUserEffect = (id: number): Effect.Effect<User, UserInvalidUserId | UserNotFound, never> => {
//     return Effect.tryPromise({
//         try: () => getUser(id),
//         catch: (error) => error as UserInvalidUserId | UserNotFound,
//     });
// };

// // idem
// const completeAsyncUserEffect =
//     Effect.flatMap(getAsyncUserEffect(id), (user) => getUserCountryEffect(user));


// Using Effect.gen to compose effects in a generator function style
const getCompleteUserEffect = (id: number) => Effect.gen(function* () {

    yield* Effect.promise(() => wait(1000));

    const user = yield* getUserEffect(id);

    if (user.id == 31)
        return yield* Effect.fail(new UserFromToulouseIsInvalid({ id }));

    const completeUser = yield* getUserCountryEffect(user);
    return completeUser;
});


const completeUserEffectInstance = getCompleteUserEffect(id);

console.log(completeUserEffectInstance);


const program2 = Effect.map(completeUserEffectInstance,
    () => Effect.match(completeUserEffectInstance, {
        onSuccess: (user) => `User ${user.name} from ${user.country}`,
        onFailure: (error) => {
            switch (error._tag) {
                case "UserInvalidUserId":
                    return `Invalid id: ${error.id}`;
                case "UserNotFound":
                    return `Not found: ${error.id}`;
                case "UserCountryNotFound":
                    return `Country not found: ${error.id}`;
                case "UserFromToulouseIsInvalid":
                    return `Rejected: ${error.id}`;
            }
        },
    }));



const program = completeUserEffectInstance.pipe(
    Effect.match({
        onSuccess: (user) => `User ${user.name} from ${user.country}`,
        onFailure: (error) => {
            switch (error._tag) {
                case "UserInvalidUserId":
                    return `Invalid id: ${error.id}`;
                case "UserNotFound":
                    return `Not found: ${error.id}`;
                case "UserCountryNotFound":
                    return `Country not found: ${error.id}`;
                case "UserFromToulouseIsInvalid":
                    return `Rejected: ${error.id}`;
            }
        },
    }),
);

const result = await Effect.runPromise(program);

console.log(result);


