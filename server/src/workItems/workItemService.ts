import {getAllUsers, getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {knex} from "../database/db";
import {Job} from "../jobs/job";
import {MonthWorkItem, WorkItem} from "./workItem";
import {getJob} from "../jobs/jobService";
import {JobNotFound} from "../jobs/jobErrors";
import {User} from "../users/user";
import {checkValidDate, checkValidMonth} from "../functions";

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

        return new WorkItem(workItem.userId, job, workItem.date, parseFloat(workItem.hours), parseFloat(workItem.cost));
    })
}

export async function getAllWorkItems(month: string) {
    const formattedMonth = checkValidMonth(month);

    const workItems = await knex("workItems")
        .join("jobs", "workItems.jobId", "jobs.id")
        .join("users", "workItems.userId", "users.id")
        .whereRaw("work_items.date LIKE ?", formattedMonth + "-%")
        .groupBy("jobs.id", "jobs.subject", "jobs.client", "jobs.finalClient", "jobs.orderName",
            "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate", "jobs.notes", "jobs.active", "jobs.lost",
            "jobs.design", "jobs.construction", "users.id", "users.role", "users.type", "users.active",
            "users.managesTickets", "users.managesOrders", "users.email", "users.name", "users.surname",
            "users.username", "users.phone", "users.hoursPerDay", "users.costPerHour", "users.car",
            "users.costPerKm")
        .select("jobs.id as jobId", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design", "jobs.construction",
            "users.id as userId", "users.role", "users.type", "users.active",
            "users.managesTickets", "users.managesOrders", "users.email", "users.name",
            "users.surname", "users.username", "users.phone", "users.hoursPerDay",
            "users.costPerHour", "users.car", "users.costPerKm",
            knex.raw("SUM(work_items.hours) as totalHours"),
            knex.raw("SUM(work_items.cost) as totalCost"));

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
            workItem.managesOrders === 1,
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

        return new MonthWorkItem(user, job, formattedMonth, parseFloat(workItem.totalHours), parseFloat(workItem.totalCost));
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
    return new WorkItem(workItem.userId, job, workItem.date, parseFloat(workItem.hours), parseFloat(workItem.cost));
}

export async function createOrUpdateWorkItem(userId: number, jobId: string, date: string, hours: number) {
    const user = await getUser(userId);
    if (!user) throw new UserNotFound();

    const cost = hours * user.costPerHour;
    const existingWorkItem = await getWorkItem(userId, jobId, date);

    if (existingWorkItem) {
        if (hours === 0) {  // delete
            await knex("workItems")
                .where({userId, jobId, date})
                .delete();
        } else {            // update
            await knex("workItems")
                .where({userId, jobId, date})
                .update({userId, jobId, date, hours, cost});
        }
    } else {                // create
        await knex("workItems")
            .insert({userId, jobId, date, hours, cost});
    }
}

// Updates all work items that have a cost equal to 0 to the current cost for the specific user.
// A service function destined to developers alone; useful after importing data.
export async function updateWorkItemsCosts() {
    const users = await getAllUsers();
    const workItems = await knex("workItems").select();

    for (let workItem of workItems) {
        // only update if cost is zero: only happens with imported data
        if (parseFloat(workItem.cost) === 0) {
            const user = users.find(user => user.id === workItem.userId);
            if (!user) throw new UserNotFound();

            const newCost = parseFloat(workItem.hours) * user.costPerHour;
            await knex("workItems")
                .where({
                    userId: workItem.userId,
                    jobId: workItem.jobId,
                    date: workItem.date
                })
                .update({cost: newCost});
        }
    }
}