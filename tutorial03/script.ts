import { exit } from "process";
import { Effect, pipe, Console, Data, Context } from "effect";

type Order = { id: number };
type User = { id: number; name: string, country?: string };

console.log(`Starting tutorial03 script`);

// read the user ID from the command line arguments
const id = Number(process.argv[2] ?? 1);


/**
 * Wait for the specified number of milliseconds.
 * @param ms The number of milliseconds to wait.
 */
function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}



class UserInvalidUserId extends Data.TaggedError("UserInvalidUserId")<{ id: number }> { }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> { }
class UserCountryNotFound extends Data.TaggedError("UserCountryNotFound")<{ id: number }> { }
class UserFromToulouseIsInvalid extends Data.TaggedError("UserFromToulouseIsInvalid")<{ id: number }> { }


//To create a new service, you need two things:
// A unique identifier.
// A type describing the possible operations of the service.

interface IUserRepository {
    getById: (id: number) => Effect.Effect<User, UserInvalidUserId | UserNotFound>
}

// Pensez ce Context comme un conteneur pour les services
// type Context = Map<ServiceKey, Service>
const UserRepository = Context.Service<IUserRepository>("UserRepository")


// implémentation du service Random
const userService : IUserRepository = {
    getById: (id: number) => {

        if (id > 500) {
            return Effect.fail(new UserNotFound({ id }));
        }

        if (id > 0) {
            return Effect.succeed({ id, name: `User ${id}` });
        }

        return Effect.fail(new UserInvalidUserId({ id }));
    }
};

const program = Effect.gen(function* () {
    yield* Effect.promise(() => wait(1000));

    const userRepository = yield* UserRepository
    yield* Console.debug(`User repository: ${typeof userRepository}`)

    const user = yield* userRepository.getById(id)

    return user;
})

// fourniture du service Random
const userContext = Effect.provideService(program, UserRepository, userService);

console.log(userContext);


const result = await Effect.runPromise(userContext);
console.log(result);


