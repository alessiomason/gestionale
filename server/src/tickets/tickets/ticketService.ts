import {knex} from "../../database/db";
import {Ticket} from "./ticket";
import {TicketCompany} from "../ticketCompanies/ticketCompany";

export async function getAllTickets() {
    const tickets = await knex("tickets")
        .join("ticketCompanies", "tickets.companyId", "=", "ticketCompanies.id")
        .select();

    return tickets.map(t => {
        const ticketCompany = new TicketCompany(t.companyId, t.name);

        return new Ticket(
            t.id,
            ticketCompany,
            t.title,
            t.description,
            t.startTime,
            t.endTime
        )
    })
}

export async function getTicket(id: number) {
    const ticket = await knex("tickets")
        .join("ticketCompanies", "tickets.companyId", "=", "ticketCompanies.id")
        .first()
        .whereRaw("tickets.id = ?", id)

    if (!ticket) return

    const ticketCompany = new TicketCompany(ticket.companyId, ticket.name);
    return new Ticket(
        ticket.id,
        ticketCompany,
        ticket.title,
        ticket.description,
        ticket.startTime,
        ticket.endTime
    )
}

export async function createTicket(
    companyId: number,
    title: string,
    description: string,
    startTime: string | undefined,
    endTime: string | undefined
) {
    const newTicket = {
        id: -1,
        companyId: companyId,
        title: title,
        description: description,
        startTime: startTime,
        endTime: endTime
    }

    const ticketIds = await knex("tickets")
        .returning("id")
        .insert(newTicket);

    return getTicket(ticketIds[0]);
}

export async function deleteTicket(id: number) {
    await knex("tickets")
        .where({id: id})
        .delete()
}