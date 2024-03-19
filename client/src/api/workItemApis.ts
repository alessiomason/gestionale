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

async function createOrUpdateWorkItem(
    jobId: string,
    date: string,
    hours: number,
    userId: number | undefined = undefined
) {
    const workItem = {jobId, date, hours, userId};

    const response = await fetch(new URL("workItems", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(workItem),
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

const workItemApis = {getWorkItems, getUserWorkItems, createOrUpdateWorkItem};
export default workItemApis;