import {apiUrl} from "./apisValues";
import {Credentials} from "../models/credentials";
import {handleApiError} from "./handleApiError";

async function login(credentials: Credentials) {
    const response = await fetch(new URL('sessions', apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
    });
    if (response.ok) {
        const res = await response.json();
        return res.user;
    } else {    // do not use handleApiError, or it would refresh to the same page
        throw await response.json();
    }
}

async function logout() {
    const response = await fetch(new URL('sessions/current', apiUrl), {
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

async function getUserInfo() {
    const response = await fetch(new URL('sessions/current', apiUrl), {
        method: 'GET',
        credentials: 'include'
    });
    if (response.ok) {
        return await response.json();
    } else {    // do not use handleApiError, or it would cause an infinite loop of refreshes on 401 status code
        throw await response.json();
    }
}

const loginApis = {Credentials, login, logout, getUserInfo};
export default loginApis;