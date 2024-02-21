import {knex} from '../../database/db';
import {TicketOrder} from "../ticketOrders/ticketOrder";
import {TicketCompany} from "./ticketCompany";

export async function getAllTicketCompanies() {
    return knex<TicketCompany>("ticketCompanies").select();
}

export async function getTicketCompany(id: number) {
    return knex<TicketCompany>("ticketCompanies")
        .first()
        .where({id: id})
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