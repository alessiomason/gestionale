import {apiUrl} from "./apisValues";
import {Job} from "../models/job";
import {handleApiError} from "./handleApiError";

async function getAllJobs() {
    const response = await fetch(new URL("jobs", apiUrl), {
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

async function getActiveJobs() {
    const response = await fetch(new URL("jobs/active", apiUrl), {
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

async function getJob(jobId: string) {
    const response = await fetch(new URL(`jobs/${jobId}`, apiUrl), {
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

async function getDetailedJob(jobId: string) {
    const response = await fetch(new URL(`jobs/${jobId}/details`, apiUrl), {
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

function prepareJobForServer(job: Job) {
    job.finalClient = job.finalClient === "" ? undefined : job.finalClient;
    job.orderName = job.orderName === "" ? undefined : job.orderName;
    job.startDate = job.startDate === "" ? null : job.startDate;
    job.deliveryDate = job.deliveryDate === "" ? null : job.deliveryDate;
    return job;
}

async function createJob(job: Job) {
    const newJob = prepareJobForServer(job);

    const response = await fetch(new URL("jobs", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newJob),
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function updateJob(job: Job) {
    const updatedJob = prepareJobForServer(job);

    const response = await fetch(new URL(`jobs/${job.id}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(updatedJob),
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

async function deleteJob(jobId: string) {
    const response = await fetch(new URL(`jobs/${jobId}`, apiUrl), {
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

const jobApis = {getAllJobs, getActiveJobs, getJob, getDetailedJob, createJob, updateJob, deleteJob};
export default jobApis;