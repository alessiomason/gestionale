import {apiUrl} from "./apisValues";

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
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
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
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

const signUpApis = {getUserFromRegistrationToken, signUp};
export default signUpApis;