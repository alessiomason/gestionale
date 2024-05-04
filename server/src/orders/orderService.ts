import {knex} from "../database/db";
import {NewOrder, Order} from "./order";
import {Job} from "../jobs/job";
import {DuplicateOrder, OrderNotFound} from "./orderErrors";
import {getJob} from "../jobs/jobService";
import {JobNotFound} from "../jobs/jobErrors";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {User} from "../users/user";
import dayjs from "dayjs";

async function parseOrder(order: any) {
    const job = new Job(
        order.jobId,
        order.subject,
        order.client,
        order.finalClient,
        order.orderName,
        parseFloat(order.orderAmount),
        order.startDate,
        order.deliveryDate,
        order.notes,
        !!order.active,
        !!order.lost,
        !!order.design,
        !!order.construction,
        order.totalWorkedHours ? parseFloat(order.totalWorkedHours) : 0
    );

    const by = new User(
        order.userId,
        order.role,
        order.type,
        order.name,
        order.surname,
        order.username,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        parseFloat(order.hoursPerDay),
        parseFloat(order.costPerHour),
        order.active === 1,
        order.managesTickets === 1,
        order.managesOrders === 1,
        order.email,
        order.phone,
        order.car,
        parseFloat(order.costPerKm)
    );

    let clearedBy: User | undefined = undefined;
    if (order.clearedById) {
        clearedBy = new User(
            order.userId2,
            order.role2,
            order.type2,
            order.name2,
            order.surname2,
            order.username2,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            parseFloat(order.hoursPerDay2),
            parseFloat(order.costPerHour2),
            order.active2 === 1,
            order.managesTickets2 === 1,
            order.managesOrders2 === 1,
            order.email2,
            order.phone2,
            order.car2,
            parseFloat(order.costPerKm2)
        );
    }

    return new Order(
        order.id,
        parseInt(order.year),
        order.date,
        job,
        order.supplier,
        order.description,
        by,
        order.scheduledDeliveryDate,
        clearedBy,
        order.clearingDate ? order.clearingDate : undefined     // if null, set undefined
    );
}

export async function getAllOrders() {
    const orders = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .join("users AS u1", "u1.id", "orders.byId")
        .leftJoin("users AS u2", "u2.id", "orders.clearedById")
        .select("orders.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design", "jobs.construction",
            "u1.role", "u1.type", "u1.name", "u1.surname", "u1.username",
            "u1.hoursPerDay", "u1.costPerHour", "u1.active", "u1.managesTickets",
            "u1.managesOrders", "u1.email", "u1.phone", "u1.car", "u1.costPerKm",
            "u2.role AS role2", "u2.type AS type2", "u2.name AS name2",
            "u2.surname AS surname2", "u2.username AS username2", "u2.hoursPerDay AS hoursPerDay2",
            "u2.costPerHour AS costPerHour2", "u2.active AS active2",
            "u2.managesTickets AS managesTickets2", "u2.managesOrders AS managesOrders2",
            "u2.email AS email2", "u2.phone AS phone2", "u2.car AS car2",
            "u2.costPerKm AS costPerKm2");

    return await Promise.all(orders.map(async order => await parseOrder(order)));
}

export async function getOrder(id: number, year: number) {
    const order = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .join("users AS u1", "u1.id", "orders.byId")
        .leftJoin("users AS u2", "u2.id", "orders.clearedById")
        .whereRaw("orders.id = ? AND year = ?", [id, year])
        .first("orders.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design", "jobs.construction",
            "u1.role", "u1.type", "u1.name", "u1.surname", "u1.username",
            "u1.hoursPerDay", "u1.costPerHour", "u1.active", "u1.managesTickets",
            "u1.managesOrders", "u1.email", "u1.phone", "u1.car", "u1.costPerKm",
            "u2.role AS role2", "u2.type AS type2", "u2.name AS name2",
            "u2.surname AS surname2", "u2.username AS username2", "u2.hoursPerDay AS hoursPerDay2",
            "u2.costPerHour AS costPerHour2", "u2.active AS active2",
            "u2.managesTickets AS managesTickets2", "u2.managesOrders AS managesOrders2",
            "u2.email AS email2", "u2.phone AS phone2", "u2.car AS car2",
            "u2.costPerKm AS costPerKm2");

    if (!order) throw new OrderNotFound();

    return await parseOrder(order);
}

async function checkValidId(id: number, year: number) {
    try {
        await getOrder(id, year);     // if new id, throws OrderNotFound
        throw new DuplicateOrder();
    } catch (err: any) {
        if (!(err instanceof OrderNotFound)) {
            throw err;
        }
    }
}

export async function createOrder(newOrder: NewOrder) {
    await checkValidId(newOrder.id, newOrder.year);

    const job = await getJob(newOrder.jobId);
    if (!job) throw new JobNotFound();
    const byUser = await getUser(newOrder.byId);
    if (!byUser) throw new UserNotFound();
    const clearedByUser = newOrder.clearedById ? await getUser(newOrder.clearedById) : undefined;

    await knex("orders").insert(newOrder);

    return new Order(
        newOrder.id,
        newOrder.year,
        newOrder.date,
        job,
        newOrder.supplier,
        newOrder.description,
        byUser,
        newOrder.scheduledDeliveryDate,
        clearedByUser,
        newOrder.clearingDate
    );
}

export async function updateOrder(id: number, year: number, updatedOrder: NewOrder) {
    if (id !== updatedOrder.id || year !== updatedOrder.year) {
        await checkValidId(updatedOrder.id, updatedOrder.year);
    }

    const updatingOrder = {...updatedOrder, byId: undefined};
    await knex("orders")
        .where({id, year})
        .update(updatingOrder);
}

export async function clearOrder(id: number, year: number, clearedById: number) {
    const clearingDate = dayjs().format("YYYY-MM-DD");
    await knex("orders")
        .where({id, year})
        .update({clearedById, clearingDate});
}

export async function unclearOrder(id: number, year: number) {
    await knex("orders")
        .where({id, year})
        .update({clearedById: null, clearingDate: null});
}

export async function deleteOrder(id: number, year: number) {
    await knex("orders")
        .where({id, year})
        .delete();
}