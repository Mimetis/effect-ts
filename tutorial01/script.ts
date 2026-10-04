import { exit } from "process";

type Order = { id: number };
type User = { id: number; name: string };

// read the user ID from the command line arguments
const id = Number(process.argv[2] ?? 1);

/**
 * Wait for the specified number of milliseconds.
 * @param ms The number of milliseconds to wait.
 */
function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


class UserInvalidUserId extends Error {
    readonly name = "UserInvalidUserId";
    readonly tag = "Error_UserInvalidUserId";
}

class UserNotFound extends Error {
    readonly name = "UserNotFound";
    readonly tag = "Error_UserNotFound";
}

class OrdersNotFound extends Error {
    readonly name = "OrdersNotFound";
    readonly tag = "Error_OrdersNotFound";
}

class UserHasNoOrders extends Error {
    readonly name = "UserHasNoOrders";
    readonly tag = "Error_UserHasNoOrders";
}



/**
 * Retrieve a user by their ID.
 * @param id The ID of the user to retrieve.    
 * @returns A promise that resolves to the user object containing the ID and name.
 */
async function getUser(id: number): Promise<User> {
    await wait(1000); // Simulate an asynchronous operation

    if (id <= 0) {
        throw new UserInvalidUserId("Invalid user ID");
    }

    if (id > 100) {
        throw new UserNotFound("User not found");
    }

    return { id, name: `User ${id}` };
}

// 1

// let user;
// try {
//     user = await getUser(id);
// }
// catch (error) {
//     console.error(typeof error === "string" ? error : (error as Error).message);
// }


// 2
// const [user, error] = await catchError(getUser(id));

// if (error) {
//     console.error(error.message);
// }
// else {
//     console.log(user);
// }



// 3 
// const [user, error] = await catchErrorTyped(getUser(id), [UserInvalidUserId, UserNotFound]);


// if (error) {
//     if (error instanceof UserInvalidUserId) {
//     console.error(error.message);
//     }
//     else if (error instanceof UserNotFound) {
//         console.error(error.message);
//     }
// }
// else{
//     // user is successfully retrieved and can't be null
//     console.log(user);
// }

// Ça marche, mais :
// il faut déclarer les erreurs à chaque appel ;
// si getUser() ajoute demain un UnauthorizedError, rien ne le signale ;
// la liste des erreurs est dupliquée entre l'implémentation et le call site.




// 4 using NeverThrow

import { ResultAsync, err, errAsync, ok, okAsync, type Result } from "neverthrow";


type GetUserError = UserInvalidUserId | UserNotFound;

/**
 * Retrieve a user by their ID, written with plain async/await.
 */
async function fetchUser(id: number): Promise<Result<User, GetUserError>> {
    await wait(1000); // Simulate an asynchronous operation

    if (id <= 0)
        return err(new UserInvalidUserId("Invalid user ID"));

    if (id > 100)
        return err(new UserNotFound("User not found"));

    return ok({ id, name: `User ${id}` });
}


const u = await fetchUser(id);

if (u.isErr()) {
    if (u.error.tag === "Error_UserInvalidUserId") {
        console.error(u.error.message);
    }
    else if (u.error.tag === "Error_UserNotFound") {
        console.error(u.error.message);
    }
    else {
        console.error("Unknown error");
    }
}
else {
    const user = u.value;
}


type GetOrdersError = OrdersNotFound | UserHasNoOrders;


function getOrders(userId: number): ResultAsync<Order[], GetOrdersError> {

    ResultAsync.fromSafePromise(wait(1000)); // Simulate an asynchronous operation

    if (userId <= 0) {
        return errAsync(new UserHasNoOrders("User has no orders"));
    }

    // Simulate fetching orders
    const orders: Order[] = [{ id: 1 }, { id: 2 }];
    
    if (orders.length === 0) {
        return errAsync(new OrdersNotFound("Orders not found"));
    }

    return okAsync(orders);
}


const fetchedUser = await fetchUser(id);

if (fetchedUser.isErr()) {
    switch (fetchedUser.error.tag) {
        case "Error_UserInvalidUserId":
            console.error(fetchedUser.error.message);
            break;
        case "Error_UserNotFound":
            console.error(fetchedUser.error.message);
            break;
        default:
            console.error("Unknown error");
    }
    exit(1);
}

const fetchOrders = await getOrders(id);

if (fetchOrders.isErr()) {
    switch (fetchOrders.error.tag) {
        case "Error_OrdersNotFound":
            console.error(fetchOrders.error.message);
            break;
        case "Error_UserHasNoOrders":
            console.error(fetchOrders.error.message);
            break;
        default:
            console.error("Unknown error");
    }
    exit(1);
}

const orders = fetchOrders.value;

/**
 * Neverthrow apporte des erreurs typées, mais la composition reste assez manuelle.

    À chaque étape je dois :

    vérifier isErr()
    faire un retour anticipé
    fusionner les unions d'erreurs moi-même

 */
