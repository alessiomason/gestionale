import {apiUrl} from "./apisValues";
import {Job} from "../../../server/src/jobs/job";
import {Ticket} from "../models/ticket";

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
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
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
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function createJob(job: Job) {
    job.finalClient = job.finalClient === "" ? undefined : job.finalClient;
    job.orderName = job.orderName === "" ? undefined : job.orderName;
    job.dueDate = job.dueDate === "" ? null : job.dueDate;
    job.deliveryDate = job.deliveryDate === "" ? null : job.deliveryDate;

    const response = await fetch(new URL("jobs", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(job),
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
}

async function updateJob(job: Job) {
    const response = await fetch(new URL(`jobs/${job.id}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(job),
    });
    if (response.ok) {
        return true;
    } else {
        throw await response.json();
    }
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
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

const jobApis = {getAllJobs, getJob, createJob, updateJob, deleteJob};
export default jobApis;