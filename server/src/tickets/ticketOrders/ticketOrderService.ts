import {knex} from '../../database/db';
import {TicketOrder} from "./ticketOrder";
import {TicketCompany} from "../ticketCompanies/ticketCompany";
import {Ticket} from "../tickets/ticket";
import retryTimes = jest.retryTimes;

export async function getTicketOrders(companyId: number) {
    const ticketOrders = await knex("ticketOrders")
        .join("ticketCompanies", "ticketOrders.companyId", "=", "ticketCompanies.id")
        .whereRaw("ticket_orders.company_id = ?", companyId)
        .select();

    return ticketOrders.map(t => {
        const ticketCompany = new TicketCompany(t.companyId, t.name);

        return new TicketOrder(t.id, ticketCompany, parseFloat(t.hours), t.date);
    })
}

export async function getTicketOrder(id: number) {
    const ticketOrder = await knex("ticketOrders")
        .join("ticketCompanies", "ticketOrders.companyId", "=", "ticketCompanies.id")
        .first()
        .whereRaw("tickets_orders.id = ?", id)

    if (!ticketOrder) return

    const ticketCompany = new TicketCompany(ticketOrder.companyId, ticketOrder.name);
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