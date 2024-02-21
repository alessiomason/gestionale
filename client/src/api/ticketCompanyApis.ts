import {apiUrl} from "./apisValues";
import {TicketCompany} from "../../../server/src/tickets/ticketCompanies/ticketCompany";

async function getAllTicketCompanies() {
    const response = await fetch(new URL("tickets/companies", apiUrl), {
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

async function createTicketCompany(ticketCompany: TicketCompany) {
    const response = await fetch(new URL("tickets/companies", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(ticketCompany),
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