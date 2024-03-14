import {apiUrl} from "./apisValues";
import {handleApiError} from "./handleApiError";

async function getWorkItems(month: string) {
    const response = await fetch(new URL(`workItems/${month}`, apiUrl), {
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

async function getUserWorkItems(month: string, userId: number) {
    const response = await fetch(new URL(`workItems/${month}/${userId}`, apiUrl), {
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

const workItemApis = {getWorkItems, getUserWorkItems};
export default workItemApis;