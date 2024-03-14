import {InvalidMonth} from "./workItemsErrors";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {knex} from "../database/db";
import {Job} from "../jobs/job";
import {WorkItem} from "./workItem";

export async function getWorkItems(userId: number, month: string) {
    // check that month is YYYY-MM
    const splitMonth = month.split("-");
    if (splitMonth.length === 2) {
        const year = parseInt(splitMonth[0]);
        if (year < 0 || Number.isNaN(year)) {
            return new InvalidMonth();
        }

        const monthOfYear = parseInt(splitMonth[1]);
        if (monthOfYear < 0 || monthOfYear > 12 || Number.isNaN(monthOfYear)) {
            return new InvalidMonth();
        }
    } else {
        return new InvalidMonth();
    }

    const user = await getUser(userId);
    if (!user) {
        return new UserNotFound();
    }

    const workItems = await knex("workItems")
        .join("users", "workItems.userId", "users.id")
        .join("jobs", "workItems.jobId", "jobs.id")
        .whereRaw("work_items.user_id = ?", user.id)
        .andWhereRaw("work_items.date LIKE ?", month + "-%")
        .select("workItems.userId", "workItems.jobId", "jobs.subject", "jobs.client",
            "jobs.finalClient", "jobs.orderName", "jobs.orderAmount", "jobs.startDate",
            "jobs.deliveryDate", "jobs.notes", "jobs.active", "jobs.lost",
            "jobs.design", "jobs.construction", "workItems.date", "workItems.hours");

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