import { readFile } from "node:fs";
// some async apis are not promise based, but callback based
import { Effect } from "effect";

/**
 * #1. Creating effects from simple values
 */
{
  // one: Effect<number> (Effect<number, never>, this effect will never fail)
  const one = Effect.succeed(1);

  // two: Effect<never, string> (Effect<never, string>, this effect will never succeed)
  const two = Effect.fail("two");

  /**
   * FUNCTION ARGUMENTS ARE EVALUATED EAGERLY, i.e. when the effect is created
   * ONLY VALUES, NO COMPUTATIONS OR SIDE EFFECTS
   */

  const bad = Effect.succeed(Date.now());
  // is equivalent to
  const now = Date.now();
  const getDate = () => now;
}

/**
 * #2. Creating effects from synchronous computations
 */
{
  // one: Effect<number> (Effect<number, never>, this effect will never fail)
  const one = Effect.sync(() => Date.now());

  // two: Effect<number> (Effect<number, never>, this effect will never fail)
  const two = Effect.sync(() => {
    console.log("side effects!");
    return 2;
  });

  const NEVER = Effect.sync(() => {
    throw new Error("will cause a defect");
  });

  /**
   * sync ASSUMES that the computation will NEVER THROW
   * if it has any chance to, use Effect.try
   */

  // tryOne: Effect<number, UnknownException>
  const tryOne = Effect.try(() => {
    throw new Error("effect will catch this error");
    return 0;
  });

  class JsonParseError extends Error {
    constructor(unknownError: unknown) {
      const baseMessage = "JSON parsing failed";
      const normalizedMessage =
        unknownError instanceof Error
          ? `${baseMessage}: ${unknownError.message}`
          : baseMessage;
      const cause =
        unknownError instanceof Error ? unknownError.cause : undefined;

      super(normalizedMessage, { cause });
      this.name = JsonParseError.name;
    }
  }
  // tryTwo: `Effect<unknown, JsonParseError>`
  const tryTwo = Effect.try({
    try: (): unknown => JSON.parse("invalid json"),
    catch: (unknownError) => new JsonParseError(unknownError),
  });
}

/**
 * #3. Creating effects from asynchronous computations
 */
{
  const wait = (ms: number): Promise<string> =>
    new Promise((resolve) => setTimeout(() => resolve("resolved!"), ms));

  // one: `Effect<string>` (`Effect<string, never>`, this effect will never fail)
  const one = Effect.promise(() => wait(1000));

  /**
   * noticed how the promise 'disappears' from the type signature
   * effect hides away sync vs async, you just work with the results
   */

  /**
   * promise ASSUMES that the computation will NEVER THROW
   * if it has any chance to, use Effect.tryPromise
   */

  // tryOne: `Effect<string, UnknownException>`
  const two = Effect.tryPromise(() =>
    fetch("https://jsonplaceholder.typicode.com/todos/1")
  );

  // tryTwo: `Effect<Response, Error>`
  const three = Effect.tryPromise({
    try: () => fetch("https://jsonplaceholder.typicode.com/todos/1"),
    catch: (cause) => new Error("something went wrong", { cause }),
  });
}

{
  /**
   * type parameters are unable to be inferred, so you have to specify them 👇
   * @returns Effect<Buffer, NodeJS.ErrnoException>
   */
  const readFileEffect = Effect.callback<Buffer, NodeJS.ErrnoException>(
    (resume, signal) => {
      readFile("package.json", { signal }, (error, data) => {
        if (error) {
          resume(Effect.fail(error));
        } else {
          resume(Effect.succeed(data));
        }
      });
    }
  );
}


const sucessfulProgram = Effect.sync(() => {
  console.log("hi!");
  return 42;
});

const failedProgram = Effect.try(() => {
  throw new Error("boom");
  return 42;
});

const asyncProgram = Effect.promise(() => Promise.resolve(42));

/**
 * just like functions, effects themselves are just values
 * they don't do anything until you 'run' them
 */

// console.log(sucessfulProgram);
// console.log(failedProgram);

/**
 * to run effects that are purely synchronous, use runSync
 * it synchronously returns the result of the effect, or throws if the effect fails
 */

// const result = Effect.runSync(sucessfulProgram);
// console.log('runSync result', result);

// try {
// 	Effect.runSync(failedProgram);
// } catch (error) {
// 	console.log('runSync error', error);
// }

// try {
// 	Effect.runSync(asyncProgram);
// } catch (error) {
// 	console.log('runSync async error', error);
// }

/**
 * if any part of your effect is asynchronous, you need to use runPromise
 * it returns a promise that will resolve with the result of the effect,
 * or reject if the effect fails
 */

// Effect.runPromise(asyncProgram).then((result) => {
// 	console.log('runPromise result', result);
// });

// Effect.runPromise(failedProgram).catch((error) => {
// 	console.log('runPromise error', error);
// });

/**
 * as an alternative to simply throwing the error, the run*Exit functions
 * provide a `Exit` type that represents either a success or a number of possible failure types
 */

// const exit = Effect.runSyncExit(failedProgram);
// console.log('runSyncExit', exit);