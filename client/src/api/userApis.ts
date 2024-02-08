import {apiUrl} from "./apisValues";
import {User} from "../models/user";

async function getAllUsers() {
    const response = await fetch(new URL("users", apiUrl), {
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

async function updateUser(user: User) {
    const response = await fetch(new URL(`users/${user.id}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(user),
    });
    if (response.ok) {
        return true;
    } else {
        throw await response.json();
    }
}

async function updateProfile(userId: number, email: string | undefined, phone: string | undefined, car: string | undefined) {
    const body = {
        email: email,
        phone: phone,
        car: car
    }

    const response = await fetch(new URL("users", apiUrl), {
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

const userApis = {getAllUsers, getUser, updateUser, updateProfile, updatePassword};
export default userApis;