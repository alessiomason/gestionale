import {knex} from '../../database/db';
import {TicketOrder} from "../ticketOrders/ticketOrder";
import {TicketCompany} from "./ticketCompany";

export async function getAllTicketCompanies() {
    const ticketCompanies = await knex<TicketCompany>("ticketCompanies").select();

    // rebuild to get access to methods of the class
    return ticketCompanies.map(ticketCompany => {
        return new TicketCompany(ticketCompany.id, ticketCompany.name);
    })
}

export async function getTicketCompany(id: number) {
    const ticketCompany = await knex<TicketCompany>("ticketCompanies")
        .first()
        .where({id: id})

    // rebuild to get access to methods of the class
    if (ticketCompany) {
        return new TicketCompany(ticketCompany.id, ticketCompany.name);
    }
}

export async function createTicketCompany(name: string) {
    const newTicketCompany = new TicketCompany(-1, name);

    const ticketCompanyIds = await knex("ticketCompanies")
        .returning("id")
        .insert(newTicketCompany);

    newTicketCompany.id = ticketCompanyIds[0];
    return newTicketCompany;
}

export async function deleteTicketCompany(id: number) {
    await knex("ticketCompanies")
        .where({id: id})
        .delete()
}