import {knex} from "../../database/db";
import {Ticket} from "./ticket";
import {TicketCompany} from "../ticketCompanies/ticketCompany";
import dayjs from "dayjs";

export async function getTickets(companyId: number) {
    const tickets = await knex("tickets")
        .join("ticketCompanies", "tickets.companyId", "=", "ticketCompanies.id")
        .whereRaw("tickets.company_id = ?", companyId)
        .select("tickets.id", "company_id", "name", "email", "contact", "title",
            "description", "startTime", "endTime");

    return tickets.map(t => {
        const ticketCompany = new TicketCompany(t.companyId, t.name, t.email, t.contact);

        return new Ticket(
            t.id,
            ticketCompany,
            t.title,
            t.description,
            t.startTime,
            t.endTime ?? undefined
        )
    })
}

export async function getTicket(id: number) {
    const ticket = await knex("tickets")
        .join("ticketCompanies", "tickets.companyId", "=", "ticketCompanies.id")
        .first("tickets.id", "company_id", "name", "email", "contact", "title",
            "description", "startTime", "endTime")
        .whereRaw("tickets.id = ?", id)

    if (!ticket) return

    const ticketCompany = new TicketCompany(ticket.companyId, ticket.name, ticket.email, ticket.contact);
    return new Ticket(
        ticket.id,
        ticketCompany,
        ticket.title,
        ticket.description,
        ticket.startTime,
        ticket.endTime ?? undefined
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
        id: undefined,
        companyId: companyId,
        title: title,
        description: description,
        startTime: startTime ?? dayjs().format(),
        endTime: endTime
    }

    const ticketIds = await knex("tickets")
        .returning("id")
        .insert(newTicket);

    return getTicket(ticketIds[0]);
}

export async function closeTicket(ticketId: number, endTime: string | undefined) {
    await knex("tickets")
        .where({id: ticketId})
        .update({endTime: endTime ?? dayjs().format()})

    return getTicket(ticketId);
}

export async function deleteTicket(id: number) {
    await knex("tickets")
        .where({id: id})
        .delete()
}