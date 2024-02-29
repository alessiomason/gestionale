import {apiUrl} from "./apisValues";
import {User} from "../models/user";
import {handleApiError} from "./handleApiError";

async function getUserFromRegistrationToken(registrationToken: string) {
    const response = await fetch(new URL(`users/registrationToken/${registrationToken}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function signUp(
    registrationToken: string,
    password: string,
    email: string | undefined,
    phone: string | undefined,
    car: string | undefined
) {
    const body = JSON.stringify({
       password: password,
       email: email,
       phone: phone,
       car: car
    });

    const response = await fetch(new URL(`signup/${registrationToken}`, apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: body
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

async function createUser(user: User) {
    user.email = user.email === "" ? undefined : user.email;
    user.phone = user.phone === "" ? undefined : user.phone;
    user.car = user.car === "" ? undefined : user.car;

    const response = await fetch(new URL("users", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(user)
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

const signUpApis = {getUserFromRegistrationToken, signUp, createUser};
export default signUpApis;