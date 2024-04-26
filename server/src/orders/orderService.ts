import {knex} from "../database/db";
import {NewOrder, Order} from "./order";
import {Job} from "../jobs/job";
import {OrderNotFound} from "./orderErrors";
import {getJob} from "../jobs/jobService";
import {JobNotFound} from "../jobs/jobErrors";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";

function parseOrder(order: any) {
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

    return new Order(
        order.id,
        order.date,
        job,
        order.supplier,
        order.description,
        order.by,
        order.scheduledDeliveryDate,
        order.clearedBy,
        order.clearingDate
    );
}

export async function getAllOrders() {
    const orders = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .select("orders.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design", "jobs.construction");

    return orders.map(order => parseOrder(order));
}

export async function getOrder(id: number) {
    const order = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .where({id: id})
        .first("orders.*", "jobs.subject", "jobs.client", "jobs.finalClient",
            "jobs.orderName", "jobs.orderAmount", "jobs.startDate", "jobs.deliveryDate",
            "jobs.notes", "jobs.active", "jobs.lost", "jobs.design", "jobs.construction");

    if (!order) throw new OrderNotFound();

    return parseOrder(order);
}

export async function createOrder(newOrder: NewOrder) {
    const orderIds = await knex("orders").insert(newOrder);

    const job = await getJob(newOrder.jobId);
    if (!job) throw new JobNotFound();
    const byUser = await getUser(newOrder.byId);
    if (!byUser) throw new UserNotFound();
    const clearedByUser = newOrder.clearedById ? await getUser(newOrder.clearedById) : undefined;

    return new Order(
        orderIds[0],
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