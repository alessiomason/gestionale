import {knex} from "../../database/db";
import {Ticket} from "./ticket";
import {TicketCompany} from "../ticketCompanies/ticketCompany";
import dayjs from "dayjs";

export async function getTickets(companyId: number) {
    const tickets = await knex("tickets")
        .join("ticketCompanies", "tickets.companyId", "=", "ticketCompanies.id")
        .whereRaw("tickets.company_id = ?", companyId)
        .select("tickets.id", "company_id", "name", "email", "contact", "title",
            "description", "startTime", "paused", "resumeTime",
            "durationBeforePause", "endTime");

    return tickets.map(t => {
        const ticketCompany = new TicketCompany(t.companyId, t.name, t.email, t.contact);

        return new Ticket(
            t.id,
            ticketCompany,
            t.title,
            t.description,
            t.startTime,
            !!t.paused,
            t.resumeTime ?? undefined,
            t.durationBeforePause ?? undefined,
            t.endTime ?? undefined
        )
    })
}

export async function getTicket(id: number) {
    const ticket = await knex("tickets")
        .join("ticketCompanies", "tickets.companyId", "=", "ticketCompanies.id")
        .first("tickets.id", "company_id", "name", "email", "contact", "title",
            "description", "startTime", "paused", "resumeTime",
            "durationBeforePause", "endTime")
        .whereRaw("tickets.id = ?", id)

    if (!ticket) return

    const ticketCompany = new TicketCompany(ticket.companyId, ticket.name, ticket.email, ticket.contact);
    return new Ticket(
        ticket.id,
        ticketCompany,
        ticket.title,
        ticket.description,
        ticket.startTime,
        !!ticket.paused,
        ticket.resumeTime ?? undefined,
        ticket.durationBeforePause ?? undefined,
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

export async function editTicket(
    ticketId: number,
    title: string | undefined,
    description: string | undefined,
    startTime: string | undefined,
    endTime: string | undefined
) {
    if (title || description || startTime || endTime) {
        const ticket = {title, description, startTime, endTime};

        await knex("tickets")
            .where({id: ticketId})
            .update(ticket);
    }

    return getTicket(ticketId);
}

export async function pauseResumeTicket(ticketId: number) {
    let ticket = await getTicket(ticketId);
    if (!ticket) return

    if (ticket.paused) {    // resume ticket
        ticket.paused = false;
        ticket.resumeTime = dayjs().format();

        await knex("tickets")
            .where({id: ticketId})
            .update({paused: false, resumeTime: ticket.resumeTime});
    } else {        // pause ticket
        ticket.paused = true;
        ticket.durationBeforePause = (ticket.durationBeforePause ?? 0) + dayjs.duration(dayjs().diff(ticket.resumeTime ?? ticket.startTime)).asMilliseconds();

        await knex("tickets")
            .where({id: ticket.id})
            .update({paused: true, durationBeforePause: ticket.durationBeforePause});
    }

    return ticket;
}

export async function deleteTicket(id: number) {
    await knex("tickets")
        .where({id: id})
        .delete()
}