import {InvalidDate} from "./workItemErrors";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {knex} from "../database/db";
import {Job} from "../jobs/job";
import {MonthWorkItem, WorkItem} from "./workItem";
import {getJob} from "../jobs/jobService";
import {JobNotFound} from "../jobs/jobErrors";
import {User} from "../users/user";

export function checkValidMonth(month: string) {
    // check that month is YYYY-MM
    const splitMonth = month.split("-");
    if (splitMonth.length === 2) {
        const year = parseInt(splitMonth[0]);
        const monthOfYear = parseInt(splitMonth[1]);
        if (year < 0 || Number.isNaN(year) ||
            monthOfYear < 0 || monthOfYear > 12 || Number.isNaN(monthOfYear)) {
            throw new InvalidDate();
        }

        return `${year}-${monthOfYear.toString().padStart(2, "0")}`;
    } else {
        throw new InvalidDate();
    }
}

export function checkValidDate(date: string) {
    // check that date is YYYY-MM-DD
    const splitDate = date.split("-");
    if (splitDate.length === 3) {
        const year = parseInt(splitDate[0]);
        const monthOfYear = parseInt(splitDate[1]);
        const day = parseInt(splitDate[2]);
        if (year < 0 || Number.isNaN(year) ||
            monthOfYear < 0 || monthOfYear > 12 || Number.isNaN(monthOfYear) ||
            day < 0 || day > 31 || Number.isNaN(day)) {
            throw new InvalidDate();
        }

        return `${year}-${monthOfYear.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    } else {
        throw new InvalidDate();
    }
}

export async function getWorkItems(userId: number, month: string) {
    const formattedMonth = checkValidMonth(month);
    const user = await getUser(userId);
    if (!user) {
        throw new UserNotFound();
    }

    const workItems = await knex("workItems")
        .join("jobs", "workItems.jobId", "jobs.id")
        .whereRaw("work_items.user_id = ?", user.id)
        .andWhereRaw("work_items.date LIKE ?", formattedMonth + "-%")
        .select("workItems.*", "jobs.subject", "jobs.client",
            "jobs.finalClient", "jobs.orderName", "jobs.orderAmount", "jobs.startDate",
            "jobs.deliveryDate", "jobs.notes", "jobs.active", "jobs.lost",
            "jobs.design", "jobs.construction");

    return workItems.map(workItem => {
        const job = new Job(
            workItem.jobId,
            workItem.subject,
            workItem.client,
            workItem.finalClient === "" ? undefined : workItem.finalClient,
            workItem.orderName === "" ? undefined : workItem.orderName,
            parseFloat(workItem.orderAmount),
            workItem.startDate === "" ? null : workItem.startDate,
            workItem.deliveryDate === "" ? null : workItem.deliveryDate,
            workItem.notes,
            workItem.active === 1,
            workItem.lost === 1,
            workItem.design === 1,
            workItem.construction === 1
        );

        return new WorkItem(workItem.userId, job, workItem.date, parseFloat(workItem.hours));
    })
}

export async function getAllWorkItems(month: string) {
    const formattedMonth = checkValidMonth(month);
    console.log(formattedMonth)

    const workItems = await knex("workItems")
        .join("jobs", "workItems.jobId", "jobs.id")
        .join("users", "workItems.userId", "users.id")
        .andWhereRaw("work_items.date LIKE ?", formattedMonth + "-%")
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
            knex.raw("SUM(work_items.hours) as totalHours"));

    return workItems.map(workItem => {
        const user = new User(
            workItem.userId,
            workItem.role,
            workItem.type,
            workItem.name,
            workItem.surname,
            workItem.username,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            parseFloat(workItem.hoursPerDay),
            parseFloat(workItem.costPerHour),
            workItem.active === 1,
            workItem.managesTickets === 1,
            workItem.email,
            workItem.phone,
            workItem.car,
            parseFloat(workItem.costPerKm)
        );

        const job = new Job(
            workItem.jobId,
            workItem.subject,
            workItem.client,
            workItem.finalClient === "" ? undefined : workItem.finalClient,
            workItem.orderName === "" ? undefined : workItem.orderName,
            parseFloat(workItem.orderAmount),
            workItem.startDate === "" ? null : workItem.startDate,
            workItem.deliveryDate === "" ? null : workItem.deliveryDate,
            workItem.notes,
            workItem.active === 1,
            workItem.lost === 1,
            workItem.design === 1,
            workItem.construction === 1
        );

        return new MonthWorkItem(user, job, formattedMonth, parseFloat(workItem.totalHours));
    })
}

export async function getWorkItem(userId: number, jobId: string, date: string) {
    const formattedDate = checkValidDate(date);
    const user = await getUser(userId);
    if (!user) {
        throw new UserNotFound();
    }

    const job = await getJob(jobId);
    if (!job) {
        throw new JobNotFound();
    }

    const workItem = await knex("workItems")
        .whereRaw("work_items.user_id = ?", user.id)
        .andWhereRaw("work_items.job_id = ?", job.id)
        .andWhereRaw("work_items.date = ?", formattedDate)
        .first();

    if (!workItem) return
    return new WorkItem(workItem.userId, job, workItem.date, parseFloat(workItem.hours));
}

export async function createOrUpdateWorkItem(userId: number, jobId: string, date: string, hours: number) {
    const existingWorkItem = await getWorkItem(userId, jobId, date);

    if (existingWorkItem) {
        if (hours === 0) {  // delete
            await knex("workItems")
                .where({userId, jobId, date})
                .delete();
        } else {            // update
            await knex("workItems")
                .where({userId, jobId, date})
                .update({userId, jobId, date, hours});
        }
    } else {                // create
        await knex("workItems")
            .insert({userId, jobId, date, hours});
    }
}