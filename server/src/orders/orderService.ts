import {knex} from "../database/db";
import {NewOrder, Order} from "./order";
import {Job} from "../jobs/job";
import {DuplicateOrder, OrderNotFound} from "./orderErrors";
import {getJob} from "../jobs/jobService";
import {JobNotFound} from "../jobs/jobErrors";
import {User} from "../users/user";
import {usersList} from "../users/usersList";
import {UserNotFound} from "../users/userErrors";
import dayjs from "dayjs";
import {sendEmail} from "../email/emailService";

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

    let partiallyClearedBy: User | undefined = undefined;
    if (order.partiallyClearedById) {
        partiallyClearedBy = new User(
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

    let clearedBy: User | undefined = undefined;
    if (order.clearedById) {
        clearedBy = new User(
            order.userId3,
            order.role3,
            order.type3,
            order.name3,
            order.surname3,
            order.username3,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            parseFloat(order.hoursPerDay3),
            parseFloat(order.costPerHour3),
            order.active3 === 1,
            order.managesTickets3 === 1,
            order.managesOrders3 === 1,
            order.email3,
            order.phone3,
            order.car3,
            parseFloat(order.costPerKm3)
        );
    }

    return new Order(
        order.id,
        parseInt(order.year),
        order.date,
        job,
        order.supplier,
        order.description,
        !!order.cancelled,
        by,
        !!order.uploadedFile,
        !!order.notifiedExpiry,
        order.scheduledDeliveryDate,
        partiallyClearedBy,
        order.partialClearingDate ? order.partialClearingDate : undefined,    // if null, set undefined
        clearedBy,
        order.clearingDate ? order.clearingDate : undefined                        // if null, set undefined
    );
}

const getOrderQueryFields = [
    "orders.*", "jobs.subject", "jobs.client", "jobs.finalClient",
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
    "u2.costPerKm AS costPerKm2",
    "u3.role AS role3", "u3.type AS type3", "u3.name AS name3",
    "u3.surname AS surname3", "u3.username AS username3", "u3.hoursPerDay AS hoursPerDay3",
    "u3.costPerHour AS costPerHour3", "u3.active AS active3",
    "u3.managesTickets AS managesTickets3", "u3.managesOrders AS managesOrders3",
    "u3.email AS email3", "u3.phone AS phone3", "u3.car AS car3",
    "u3.costPerKm AS costPerKm3"
];

export async function getAllOrders() {
    const orders = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .join("users AS u1", "u1.id", "orders.byId")
        .leftJoin("users AS u2", "u2.id", "orders.partiallyClearedById")
        .leftJoin("users AS u3", "u3.id", "orders.clearedById")
        .select(...getOrderQueryFields);

    return await Promise.all(orders.map(async order => parseOrder(order)));
}

export async function getOrder(id: number, year: number) {
    const order = await knex("orders")
        .join("jobs", "jobs.id", "orders.jobId")
        .join("users AS u1", "u1.id", "orders.byId")
        .leftJoin("users AS u2", "u2.id", "orders.partiallyClearedById")
        .leftJoin("users AS u3", "u3.id", "orders.clearedById")
        .whereRaw("orders.id = ? AND year = ?", [id, year])
        .first(...getOrderQueryFields);

    if (!order) throw new OrderNotFound();

    return parseOrder(order);
}

export async function notifyExpiredOrders() {
    const orders = await getAllOrders();
    const notifyingOrders = orders.filter(order =>      // expired uncleared non-cancelled orders
        !order.notifiedExpiry && !order.cancelled && !order.clearedBy && !order.clearingDate &&
        order.scheduledDeliveryDate && dayjs(order.scheduledDeliveryDate).isBefore(dayjs()));

    if (notifyingOrders.length === 0) {
        return;
    }

    const ordersLink = `${process.env.APP_URL}/orders`;
    const mailHTML = `
        <h3>Sono presenti dei nuovi ordini inevasi scaduti.</h3>
        <p>Ecco l'elenco degli ordini:</p>
        <ul>
            ${notifyingOrders.map(order => `<li>${order.name}</li>\n`).join("")}
        </ul>
        <p><a href=${ordersLink}>Clicca qui</a> per accedere alla pagina degli ordini.</p>
        <p>Questa email è stata generata automaticamente.</p>`;

    const mailText = `
Sono presenti dei nuovi ordini inevasi scaduti.\n
Ecco l'elenco degli ordini:\n
${notifyingOrders.map(order => `- ${order.name}\n`).join("")}
Questa email è stata generata automaticamente.`;

    await sendEmail(process.env.ORDERS_NOTIFICATION_EMAIL as string, "Nuovi ordini inevasi scaduti", mailHTML, mailText);

    // mark all notified orders as such
    await knex("orders")
        .whereIn(["id", "year"], notifyingOrders.map(o => [o.id, o.year]))
        .update({notifiedExpiry: true});
}

async function checkValidId(id: number, year: number) {
    try {
        await getOrder(id, year);     // if new id, throws OrderNotFound
    } catch (err: any) {
        if (err instanceof OrderNotFound) {
            return;
        }
        throw err;
    }

    throw new DuplicateOrder();
}

export async function createOrder(newOrder: NewOrder) {
    await checkValidId(newOrder.id, newOrder.year);

    const job = await getJob(newOrder.jobId);
    if (!job) throw new JobNotFound();
    const byUser = await usersList.getCachedUser(newOrder.byId);
    if (!byUser) throw new UserNotFound();
    const partiallyClearedByUser = newOrder.partiallyClearedById ?
        await usersList.getCachedUser(newOrder.partiallyClearedById) : undefined;
    const clearedByUser = newOrder.clearedById ? await usersList.getCachedUser(newOrder.clearedById) : undefined;

    await knex("orders").insert(newOrder);

    return new Order(
        newOrder.id,
        newOrder.year,
        newOrder.date,
        job,
        newOrder.supplier,
        newOrder.description,
        false,
        byUser,
        false,
        false,
        newOrder.scheduledDeliveryDate,
        partiallyClearedByUser,
        newOrder.partialClearingDate,
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

export async function updateOrderCancelStatus(id: number, year: number, cancelled: boolean) {
    await knex("orders")
        .where({id, year})
        .update({cancelled});
}

export async function clearOrder(id: number, year: number, clearedById: number, partially: boolean = false) {
    const clearingDate = dayjs().format("YYYY-MM-DD");
    const partialUpdate = {
        partiallyClearedById: clearedById,
        partialClearingDate: clearingDate
    }

    await knex("orders")
        .where({id, year})
        .update(partially ? partialUpdate : {clearedById, clearingDate});
}

export async function unclearOrder(id: number, year: number, partially: boolean = false) {
    await knex("orders")
        .where({id, year})
        .update(partially ? {partiallyClearedById: null, partialClearingDate: null} : {
            clearedById: null,
            clearingDate: null
        });
}

export async function uploadedOrderFile(id: number, year: number) {
    await knex("orders")
        .where({id, year})
        .update({uploadedFile: true});
}

export async function deleteOrder(id: number, year: number) {
    await knex("orders")
        .where({id, year})
        .delete();
}