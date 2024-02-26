import {apiUrl} from "./apisValues";
import {TicketCompany} from "../models/ticketCompany";

async function getAllTicketCompanies() {
    const response = await fetch(new URL("tickets/companies", apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        const ticketCompanies = await response.json() as TicketCompany[];
        return ticketCompanies.map(ticketCompany => {
            return new TicketCompany(
                ticketCompany.id,
                ticketCompany.name,
                ticketCompany.email,
                ticketCompany.contact,
                ticketCompany.usedHours,
                ticketCompany.orderedHours
            );
        })
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function getTicketCompany(ticketCompanyId: string) {
    const response = await fetch(new URL(`tickets/companies/${ticketCompanyId}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

async function createTicketCompany(name: string, email: string | undefined, contact: string | undefined) {
    const body = {
        name: name,
        email: email,
        contact: contact
    }

    const response = await fetch(new URL("tickets/companies", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body),
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
}

async function deleteTicketCompany(ticketCompanyId: string) {
    const response = await fetch(new URL(`tickets/companies/${ticketCompanyId}`, apiUrl), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return true;
    } else {
        const errDetail = await response.json();
        throw errDetail.message;
    }
}

const ticketCompanyApis = {getAllTicketCompanies, getTicketCompany, createTicketCompany, deleteTicketCompany};
export default ticketCompanyApis;