import {knex} from '../database/db';
import {Job} from "./job";
import {DuplicateJob} from "./jobErrors";

export async function getAllJobs() {
    return knex<Job>("jobs").select();
}

export async function getJob(id: string) {
    return knex<Job>("jobs")
        .first()
        .where({id: id})
}

export async function createJob(newJob: Job) {
    const existingJob = await getJob(newJob.id);
    if (existingJob) return new DuplicateJob();

    await knex("jobs").insert(newJob);
    return newJob;
}

export async function updateJob(job: Job) {
    await knex("jobs")
        .where({id: job.id})
        .update(job)
}

export async function deleteJob(id: string) {
    await knex("jobs")
        .where({id: id})
        .delete()
}