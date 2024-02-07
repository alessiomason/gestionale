import {apiUrl} from "./apisValues";

async function getUser(userId: number) {
    const response = await fetch(new URL(`users/${userId}`, apiUrl), {
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

async function updateUser(userId: number, email: string | undefined, phone: string | undefined, car: string | undefined) {
    const body = {
        email: email,
        phone: phone,
        car: car
    }

    const response = await fetch(new URL(`users/${userId}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body),
    });
    if (response.ok) {
        return true;
    } else {
        throw await response.json();
    }
}

async function updatePassword(userId: number, oldPassword: string, newPassword: string) {
    const body = {
        oldPassword: oldPassword,
        newPassword: newPassword
    }

    const response = await fetch(new URL(`users/password/${userId}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body),
    });
    if (response.ok) {
        return true;
    } else {
        throw await response.json();
    }
}

const profileApis = {getUser, updateUser, updatePassword};
export default profileApis;