import { Data, Effect } from "effect"

class InvalidUserId extends Data.TaggedError("InvalidUserId")<{ id: number }> { }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> { }
class CountryNotFound extends Data.TaggedError("CountryNotFound")<{ id: number }> { }
type User = { id: number; name: string }

const getUser = (id: number): Effect.Effect<User, InvalidUserId | UserNotFound> =>
  id <= 0 ? Effect.fail(new InvalidUserId({ id }))
    : id > 100 ? Effect.fail(new UserNotFound({ id }))
      : Effect.succeed({ id, name: `User ${id}` })

const getCountry = (user: User): Effect.Effect<string, CountryNotFound> =>
  user.id === 31 ? Effect.fail(new CountryNotFound({ id: user.id }))
    : Effect.succeed(user.id > 50 ? "France" : "Belgique")


const getUser2 = (id: number) => {
  return Effect.gen(function* () {

    if (id <= 0) return yield* Effect.fail(new InvalidUserId({ id }))
    if (id > 100) return yield* Effect.fail(new UserNotFound({ id }))
    return   yield* Effect.succeed({ id, name: `User ${id}` })
  
  })
}


const program = (id: number) => // les 3 erreurs sont dans le type
  getUser(id).pipe(
    Effect.flatMap((user) =>
      getCountry(user).pipe(
        Effect.map((country) => `✅ ${user.name} (${country})`),
      ),
    ),
  )

const describe = (id: number) =>
  program(id).pipe(
    Effect.catchTags({
      InvalidUserId: (e) => Effect.succeed(`⚠️ id invalide : ${e.id}`),
      UserNotFound: (e) => Effect.succeed(`🔍 introuvable : ${e.id}`),
      CountryNotFound: (e) => Effect.succeed(`🌍 pays inconnu : ${e.id}`),
    }),
  )

for (const id of [1, 99, 0, 999, 31]) console.log(Effect.runSync(describe(id)))