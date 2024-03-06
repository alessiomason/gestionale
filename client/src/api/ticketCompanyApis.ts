import {apiUrl} from "./apisValues";
import {TicketCompany} from "../models/ticketCompany";
import {handleApiError} from "./handleApiError";

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
    } else await handleApiError(response);
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
        const ticketCompany = await response.json();
        return new TicketCompany(
            ticketCompany.id,
            ticketCompany.name,
            ticketCompany.email,
            ticketCompany.contact,
            ticketCompany.usedHours,
            ticketCompany.orderedHours
        );
    } else await handleApiError(response);
}

async function createTicketCompany(name: string, email: string | undefined, contact: string | undefined) {
    const body = {
        name: name,
        email: email === "" ? undefined : email,
        contact: contact === "" ? undefined : contact
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
        const newTicketCompany = await response.json();
        return new TicketCompany(
            newTicketCompany.id,
            newTicketCompany.name,
            newTicketCompany.email,
            newTicketCompany.contact,
            newTicketCompany.usedHours,
            newTicketCompany.orderedHours
        );
    } else await handleApiError(response);
}

async function updateTicketCompany(ticketCompany: TicketCompany) {
    const response = await fetch(new URL(`tickets/companies/${ticketCompany.id}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(ticketCompany),
    });
    if (response.ok) {
        const updatedTicketCompany = await response.json();
        return new TicketCompany(
            updatedTicketCompany.id,
            updatedTicketCompany.name,
            updatedTicketCompany.email,
            updatedTicketCompany.contact,
            updatedTicketCompany.usedHours,
            updatedTicketCompany.orderedHours
        );
    } else await handleApiError(response);
}

async function deleteTicketCompany(ticketCompanyId: number) {
    const response = await fetch(new URL(`tickets/companies/${ticketCompanyId}`, apiUrl), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

const ticketCompanyApis = {
    getAllTicketCompanies,
    getTicketCompany,
    createTicketCompany,
    updateTicketCompany,
    deleteTicketCompany
};
export default ticketCompanyApis;