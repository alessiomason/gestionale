import {apiUrl} from "./apisValues";
import {User} from "../models/user";
import {handleApiError} from "./handleApiError";

async function getAllUsers() {
    const response = await fetch(new URL("users", apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function getAllMachineUsers() {
    const response = await fetch(new URL("users/machines", apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function getUser(userId: number) {
    const response = await fetch(new URL(`users/${userId}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
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
    } else await handleApiError(response);
}

async function updateProfile(email: string | undefined, phone: string | undefined, car: string | undefined) {
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
    } else await handleApiError(response);
}

async function updatePassword(oldPassword: string, newPassword: string) {
    const body = {
        oldPassword: oldPassword,
        newPassword: newPassword
    }

    const response = await fetch(new URL("users/password", apiUrl), {
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
    } else await handleApiError(response);
}

const userApis = {getAllUsers, getAllMachineUsers, getUser, updateUser, updateProfile, updatePassword};
export default userApis;