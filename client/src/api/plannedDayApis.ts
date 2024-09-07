import {apiUrl} from "./apisValues";
import {handleApiError} from "./handleApiError";
import {PlannedDay} from "../models/plannedDay";

async function getAllPlannedDays(month: string) {
    const response = await fetch(new URL(`plannedDays/${month}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json() as PlannedDay[];
    } else await handleApiError(response);
}

async function createOrUpdatePlannedDay(newPlannedDay: PlannedDay) {
    const body = {
        userId: newPlannedDay.user.id,
        date: newPlannedDay.date,
        jobId: newPlannedDay.job.id
    }

    const response = await fetch(new URL("plannedDays", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

async function deletePlannedDay(plannedDay: PlannedDay) {
    const response = await fetch(new URL(`plannedDays/${plannedDay.user.id}/${plannedDay.date}`, apiUrl), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

const plannedDaysApis = {getAllPlannedDays, createOrUpdatePlannedDay, deletePlannedDay};
export default plannedDaysApis;