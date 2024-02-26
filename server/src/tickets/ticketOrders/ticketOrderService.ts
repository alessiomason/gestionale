import {knex} from '../../database/db';
import {TicketOrder} from "./ticketOrder";
import {TicketCompany} from "../ticketCompanies/ticketCompany";

export async function getTicketOrders(companyId: number) {
    const ticketOrders = await knex("ticketOrders")
        .join("ticketCompanies", "ticketOrders.companyId", "=", "ticketCompanies.id")
        .whereRaw("ticket_orders.company_id = ?", companyId)
        .select("ticket_orders.id", "company_id", "name", "email",
            "contact","hours", "date");

    return ticketOrders.map(t => {
        const ticketCompany = new TicketCompany(t.companyId, t.name, t.email, t.contact);

        return new TicketOrder(t.id, ticketCompany, parseFloat(t.hours), t.date);
    })
}

export async function getTicketOrder(id: number) {
    const ticketOrder = await knex("ticketOrders")
        .join("ticketCompanies", "ticketOrders.companyId", "=", "ticketCompanies.id")
        .first("ticket_orders.id", "company_id", "name", "email",
            "contact", "hours", "date")
        .whereRaw("ticket_orders.id = ?", id)

    if (!ticketOrder) return

    const ticketCompany = new TicketCompany(ticketOrder.companyId, ticketOrder.name, ticketOrder.email, ticketOrder.contact);
    return new TicketOrder(ticketOrder.id, ticketCompany, parseFloat(ticketOrder.hours), ticketOrder.date)
}

export async function createTicketOrder(
    companyId: number,
    hours: number,
    date: string | undefined
) {
    const ticketOrder = {
        id: undefined,
        companyId: companyId,
        hours: hours,
        date: date
    }

    const ticketOrderIds = await knex("ticketOrders")
        .returning("id")
        .insert(ticketOrder);

    return getTicketOrder(ticketOrderIds[0]);
}

export async function deleteTicketOrder(id: number) {
    await knex("ticketOrders")
        .where({id: id})
        .delete()
}