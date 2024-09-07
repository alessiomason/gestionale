import {checkValidDate, checkValidMonth} from "../functions";
import {knex} from "../database/db";
import {Job} from "../jobs/job";
import {User} from "../users/user";
import {PlannedDay, RawPlannedDay} from "./plannedDay";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {PlannedDayNotFound} from "./plannedDayErrors";

const getPlannedDayQueryFields = [
    "plannedDays.*", "jobs.subject", "jobs.client", "jobs.finalClient",
    "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
    "jobs.notes", "jobs.active", "jobs.lost", "jobs.design",
    "jobs.construction", "users.role", "users.type", "users.name",
    "users.surname", "users.username", "users.hoursPerDay", "users.costPerHour",
    "users.active", "users.managesTickets", "users.managesOrders", "users.email",
    "users.phone", "users.car", "users.costPerKm"
];

function parsePlannedDay(plannedDay: any) {
    const user = new User(
        plannedDay.userId,
        plannedDay.role,
        plannedDay.type,
        plannedDay.name,
        plannedDay.surname,
        plannedDay.username,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        parseFloat(plannedDay.hoursPerDay),
        parseFloat(plannedDay.costPerHour),
        plannedDay.active === 1,
        plannedDay.managesTickets === 1,
        plannedDay.managesOrders === 1,
        plannedDay.email,
        plannedDay.phone,
        plannedDay.car,
        parseFloat(plannedDay.costPerKm)
    );

    const job = new Job(
        plannedDay.jobId,
        plannedDay.subject,
        plannedDay.client,
        plannedDay.finalClient,
        plannedDay.orderName,
        parseFloat(plannedDay.orderAmount),
        plannedDay.startDate,
        plannedDay.deliveryDate,
        plannedDay.notes,
        !!plannedDay.active,
        !!plannedDay.lost,
        !!plannedDay.design,
        !!plannedDay.construction,
        plannedDay.totalWorkedHours ? parseFloat(plannedDay.totalWorkedHours) : 0
    );

    return new PlannedDay(user, plannedDay.date, job);
}

export async function getAllPlannedDays(month: string) {
    const formattedMonth = checkValidMonth(month);

    const plannedDays = await knex("plannedDays")
        .whereRaw("date LIKE ?", formattedMonth + "-%")
        .leftJoin("users", "users.id", "plannedDays.userId")
        .leftJoin("jobs", "jobs.id", "plannedDays.jobId")
        .select(...getPlannedDayQueryFields);

    return plannedDays.map(plannedDay => parsePlannedDay(plannedDay));
}

export async function getPlannedDay(userId: number, date: string) {
    const formattedDate = checkValidDate(date);
    const user = await getUser(userId);
    if (!user) {
        throw new UserNotFound();
    }

    const plannedDay = await knex("plannedDays")
        .whereRaw("user_id = ?", user.id)
        .andWhereRaw("date = ?", formattedDate)
        .first();

    if (!plannedDay) return

    return parsePlannedDay(plannedDay);
}

export async function createOrUpdatePlannedDay(rawPlannedDay: RawPlannedDay) {
    const existingPlannedDay = await getPlannedDay(rawPlannedDay.userId, rawPlannedDay.date);

    if (existingPlannedDay) {
        await knex("plannedDays")
            .where({
                userId: rawPlannedDay.userId,
                date: rawPlannedDay.date
            })
            .update(rawPlannedDay);
    } else {
        await knex("plannedDays")
            .insert(rawPlannedDay);
    }
}

export async function deletePlannedDay(userId: number, date: string) {
    const existingPlannedDay = await getPlannedDay(userId, date);
    if (!existingPlannedDay) {
        throw new PlannedDayNotFound();
    }

    await knex("plannedDays")
        .where({userId: existingPlannedDay.user.id, date: existingPlannedDay.date})
        .delete();
}