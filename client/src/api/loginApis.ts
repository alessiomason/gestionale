const base_url = process.env.NODE_ENV === "production" ? "https://tm-gestionale-d0730417ec44.herokuapp.com" : "http://localhost";
const port = process.env.NODE_ENV === "production" ? 443 : 3001;
const apiUrl = new URL(`${base_url}:${port}/api/`)

export class Credentials {
    username: string
    password: string

    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}

async function login(credentials: Credentials) {
    let response = await fetch(new URL('sessions', apiUrl), {
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
        throw errDetail.message;
    }
}

const loginApis = {Credentials, login};
export default loginApis;