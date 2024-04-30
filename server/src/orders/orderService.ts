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

    const by = await getUser(order.byId);
    if (!by) throw new UserNotFound();
    let clearedBy: User | undefined = undefined;
    if (order.clearedById) {
        clearedBy = await getUser(order.clearedById);
        if (!clearedBy) throw new UserNotFound();
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
        order.clearingDate
    );
}

export async function getAllOrders() {
    const orders = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .select("orders.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design", "jobs.construction");

    return await Promise.all(orders.map(async order => await parseOrder(order)));
}

export async function getOrder(id: number, year: number) {
    const order = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .whereRaw("orders.id = ?", [id])
        .andWhereRaw("orders.year = ?", [year])
        .first("orders.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design", "jobs.construction");

    if (!order) throw new OrderNotFound();

    return await parseOrder(order);
}

async function checkValidId(id: number, year: number) {
    try {
        await getOrder(id, year);     // if new id, throws OrderNotFound
        throw new DuplicateOrder();
    } catch (err: any) {
        if (err !instanceof OrderNotFound) {
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

export async function updateOrder(id: number, updatedOrder: NewOrder) {
    await checkValidId(updatedOrder.id, updatedOrder.year);
    const updatingOrder = {...updatedOrder, byId: undefined};
    await knex("orders")
        .where({id})
        .update(updatingOrder);
}

export async function clearOrder(id: number, year: number, clearedById: number) {
    const clearingDate = dayjs().format("YYYY-MM-DD");
    await knex("orders")
        .where({id, year})
        .update({clearedById, clearingDate});
}

export async function deleteOrder(id: number, year: number) {
    await knex("orders")
        .where({id, year})
        .delete();
}