import {knex} from '../database/db';
import {Job} from "./job";
import {DuplicateJob} from "./jobErrors";

// Parses numbers (db returns them as strings).
function parseJobs(jobs: [{
    id: string
    subject: string
    client: string
    finalClient: string | undefined
    orderName: string | undefined
    orderAmount: string
    startDate: string | null | undefined
    deliveryDate: string | null | undefined
    notes: string | undefined
    active: boolean | undefined
    lost: boolean | undefined
    design: boolean | undefined
    construction: boolean | undefined
    totalWorkedHours: string
}]) {
    return jobs.map(job => new Job(
        job.id,
        job.subject,
        job.client,
        job.finalClient,
        job.orderName,
        parseFloat(job.orderAmount),
        job.startDate,
        job.deliveryDate,
        job.notes,
        job.active,
        job.lost,
        job.design,
        job.construction,
        parseFloat(job.totalWorkedHours)
    ));
}

export async function getAllJobs() {
    const jobs = await knex<Job>("jobs")
        .join("workItems", "workItems.jobId", "jobs.id")
        .groupBy("jobs.id")
        .sum({totalWorkedHours: "workItems.hours"})
        .select("jobs.*") as any;

    return parseJobs(jobs);
}

export async function getActiveJobs() {
    const activeJobs = await knex<Job>("jobs")
        .where({active: true})
        .join("workItems", "workItems.jobId", "jobs.id")
        .groupBy("jobs.id")
        .sum({totalWorkedHours: "workItems.hours"})
        .select("jobs.*") as any;

    return parseJobs(activeJobs);
}

export async function getJob(id: string) {
    const job = await knex<Job>("jobs")
        .where({id: id})
        .join("workItems", "workItems.jobId", "jobs.id")
        .groupBy("jobs.id")
        .sum({totalWorkedHours: "workItems.hours"})
        .first("jobs.*") as any;

    if (!job) return

    return parseJobs([job])[0];
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
        .update(job);
}

export async function deleteJob(id: string) {
    await knex("jobs")
        .where({id: id})
        .delete();
}