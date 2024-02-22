import {knex} from '../../database/db';
import {TicketOrder} from "./ticketOrder";
import {TicketCompany} from "../ticketCompanies/ticketCompany";
import {Ticket} from "../tickets/ticket";

export async function getTicketOrders(companyId: number) {
    const ticketOrders = await knex("ticketOrders")
        .join("ticketCompanies", "ticketOrders.companyId", "=", "ticketCompanies.id")
        .whereRaw("ticketOrders.companyId = ?", companyId)
        .select();

    return ticketOrders.map(t => {
        const ticketCompany = new TicketCompany(t.companyId, t.name);

        return new TicketOrder(t.id, ticketCompany, t.hours, t.date);
    })
}

export async function getTicketOrder(id: number) {
    const ticketOrder = await knex("ticketOrders")
        .join("ticketCompanies", "ticketOrders.companyId", "=", "ticketCompanies.id")
        .first()
        .whereRaw("ticketsOrders.id = ?", id)

    if (!ticketOrder) return

    const ticketCompany = new TicketCompany(ticketOrder.companyId, ticketOrder.name);
    return new TicketOrder(ticketOrder.id, ticketCompany, ticketOrder.hours, ticketOrder.date)
}

export async function createTicketOrder(
    companyId: number,
    hours: number,
    date: string | undefined
) {
    const ticketOrder = {
        id: -1,
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