import {knex} from '../../database/db';
import {TicketCompany} from "./ticketCompany";

export async function getAllTicketCompanies() {
    const ticketCompanies = await knex<TicketCompany>("ticketCompanies").select();

    // rebuild to get access to methods of the class
    return ticketCompanies.map(ticketCompany => {
        return new TicketCompany(ticketCompany.id, ticketCompany.name, ticketCompany.email, ticketCompany.contact);
    })
}

export async function getTicketCompany(id: number) {
    const ticketCompany = await knex<TicketCompany>("ticketCompanies")
        .first()
        .where({id: id})

    // rebuild to get access to methods of the class
    if (ticketCompany) {
        return new TicketCompany(ticketCompany.id, ticketCompany.name, ticketCompany.email, ticketCompany.contact);
    }
}

export async function createTicketCompany(name: string, email: string | undefined, contact: string | undefined) {
    const newTicketCompany = {
        id: undefined,
        name: name,
        email: email,
        contact: contact
    }

    const ticketCompanyIds = await knex("ticketCompanies")
        .returning("id")
        .insert(newTicketCompany);

    return new TicketCompany(ticketCompanyIds[0], name, email, contact);
}

export async function updateTicketCompany(ticketCompany: TicketCompany) {
    await knex("ticketCompanies")
        .where({id: ticketCompany.id})
        .update(ticketCompany);
}

export async function deleteTicketCompany(id: number) {
    await knex("ticketCompanies")
        .where({id: id})
        .delete()
}