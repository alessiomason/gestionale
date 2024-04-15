import {knex} from '../database/db';
import {DetailedJob, Job, JobUserHours} from "./job";
import {DuplicateJob} from "./jobErrors";
import {User} from "../users/user";

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
    totalWorkedHours: string | null
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
        !!job.active,
        !!job.lost,
        !!job.design,
        !!job.construction,
        job.totalWorkedHours ? parseFloat(job.totalWorkedHours) : 0
    ));
}

export async function getAllJobs() {
    const jobs = await knex<Job>("jobs")
        .leftJoin("workItems", "workItems.jobId", "jobs.id")
        .groupBy("jobs.id")
        .sum({totalWorkedHours: "workItems.hours"})
        .select("jobs.*") as any;

    return parseJobs(jobs);
}

export async function getActiveJobs() {
    const activeJobs = await knex<Job>("jobs")
        .where({active: true})
        .leftJoin("workItems", "workItems.jobId", "jobs.id")
        .groupBy("jobs.id")
        .sum({totalWorkedHours: "workItems.hours"})
        .select("jobs.*") as any;

    return parseJobs(activeJobs);
}

export async function getJob(id: string) {
    const job = await knex("jobs")
        .where({id: id})
        .leftJoin("workItems", "workItems.jobId", "jobs.id")
        .groupBy("jobs.id")
        .sum({totalWorkedHours: "workItems.hours"})
        .first("jobs.*") as any;

    if (!job) return

    return parseJobs([job])[0];
}

export async function getDetailedJob(id: string) {
    const jobUserHoursResult = await knex("jobs")
        .leftJoin("workItems", "workItems.jobId", "jobs.id")
        .leftJoin("users", "workItems.userId", "users.id")
        .whereRaw("jobs.id = ?", [id])
        .groupBy("jobs.id", "jobs.subject", "jobs.client", "jobs.finalClient", "jobs.orderName",
            "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate", "jobs.notes", "jobs.active", "jobs.lost",
            "jobs.design", "jobs.construction", "users.id", "users.role", "users.type", "users.active",
            "users.managesTickets", "users.email", "users.name", "users.surname", "users.username",
            "users.phone", "users.hoursPerDay", "users.costPerHour", "users.car", "users.costPerKm")
        .select("jobs.id as jobId", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design",
            "jobs.construction", "users.id as userId", "users.role", "users.type",
            "users.active", "users.managesTickets", "users.email", "users.name",
            "users.surname", "users.username", "users.phone", "users.hoursPerDay",
            "users.costPerHour", "users.car", "users.costPerKm",
            knex.raw("SUM(work_items.hours) AS totalHours"),
            knex.raw("SUM(work_items.cost) AS totalCost")
        );

    if (!jobUserHoursResult || jobUserHoursResult.length === 0) return

    let totalWorkedHours = 0;
    let totalCost = 0;

    const jobUserHours = jobUserHoursResult
        .filter(jobUserHours => jobUserHours.userId !== null)
        .map(jobUserHours => {
            const user = new User(
                jobUserHours.userId,
                jobUserHours.role,
                jobUserHours.type,
                jobUserHours.name,
                jobUserHours.surname,
                jobUserHours.username,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                parseFloat(jobUserHours.hoursPerDay),
                parseFloat(jobUserHours.costPerHour),
                !!jobUserHours.active,
                !!jobUserHours.managesTickets,
                jobUserHours.email,
                jobUserHours.phone,
                jobUserHours.car,
                parseFloat(jobUserHours.costPerKm)
            );

            totalWorkedHours += parseFloat(jobUserHours.totalHours);
            totalCost += parseFloat(jobUserHours.totalCost);
            return new JobUserHours(user, parseFloat(jobUserHours.totalHours), parseFloat(jobUserHours.totalCost));
        })

    return new DetailedJob(
        jobUserHoursResult[0].jobId,
        jobUserHoursResult[0].subject,
        jobUserHoursResult[0].client,
        jobUserHoursResult[0].finalClient,
        jobUserHoursResult[0].orderName,
        parseFloat(jobUserHoursResult[0].orderAmount),
        jobUserHoursResult[0].startDate,
        jobUserHoursResult[0].deliveryDate,
        jobUserHoursResult[0].notes,
        !!jobUserHoursResult[0].active,
        !!jobUserHoursResult[0].lost,
        !!jobUserHoursResult[0].design,
        !!jobUserHoursResult[0].construction,
        totalWorkedHours,
        totalCost,
        jobUserHours
    );
}

export async function createJob(job: Job) {
    const existingJob = await getJob(job.id);
    if (existingJob) return new DuplicateJob();

    // do not insert totalWorkedHours in new job
    const {totalWorkedHours, ...creatingJob} = newJob;
    await knex("jobs").insert(creatingJob);
    return newJob;
}

export async function updateJob(job: Job) {
    const updatingJob = {...job, totalWorkedHours: undefined};
    await knex("jobs")
        .where({id: job.id})
        .update(updatingJob);
}

export async function deleteJob(id: string) {
    await knex("jobs")
        .where({id: id})
        .delete();
}