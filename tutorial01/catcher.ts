
/**
 * Catch errors from a promise and return them in a tuple.
 * @param promise The promise to catch errors from.
 * @returns A tuple [result, null] on success, or [null, error] on failure.
 */
export async function catchError<T>(promise: Promise<T>): Promise<[T, null] | [null, Error]> {
    try {
        const result = await promise;
        return [result, null];
    } catch (error) {
        return [null, error as Error];
    }
}


/**
 * A type representing a constructor for an Error object.
 */
type BaseError = new (message?: string) => Error;


/**
 * Await a promise and return a [result, error] tuple.
 * Only the listed error classes are caught; any other error is rethrown.
 */
export async function catchErrorTyped<T, E extends readonly BaseError[]>(
    promise: Promise<T>,
    errors: E
): Promise<[T, null] | [null, InstanceType<E[number]>]> {
    try {
        const r = await promise;
        return [r, null];
    } catch (error) {
        // Check if the error is an instance of any of the expected error classes.
        if (errors.some(e => error instanceof e)) {
            return [null, error as InstanceType<E[number]>];
        }
        throw error;
    }
}
