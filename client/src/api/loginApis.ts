import {apiUrl} from "./apisValues";
import {Credentials} from "../models/credentials";

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
    } else {
        throw await response.json();
    }
}

async function logout() {
    const response = await fetch(new URL('sessions/current', apiUrl), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    });
    if (response.ok) {
        return true;
    } else {
        throw await response.json();
    }
}

const loginApis = {Credentials, login, logout};
export default loginApis;