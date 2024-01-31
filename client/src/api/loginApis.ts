import {apiUrl} from "./apisValues";

export class Credentials {
    username: string
    password: string

    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}

async function login(credentials: Credentials) {
    const response = await fetch(new URL('sessions', apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        return await response.json();
    } else {
        const errDetail = await response.json();
        throw errDetail;
    }
}

const loginApis = {Credentials, login};
export default loginApis;