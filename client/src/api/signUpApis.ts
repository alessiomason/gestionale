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

const signUpApis = {getUserFromRegistrationToken};
export default signUpApis;