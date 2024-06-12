import {apiUrl} from "./apisValues";
import {Ticket} from "../models/ticket";
import {handleApiError} from "./handleApiError";

async function getTickets(ticketCompanyId: number) {
    const response = await fetch(new URL(`tickets/company/${ticketCompanyId}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function getTicket(ticketId: string) {
    const response = await fetch(new URL(`tickets/${ticketId}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function createTicket(ticket: Ticket) {
    const response = await fetch(new URL("tickets", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(ticket),
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function closeTicket(ticketId: number, endTime: string | undefined) {
    const body = {
        endTime: endTime
    }

    const response = await fetch(new URL(`tickets/${ticketId}/close`, apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body),
    });
    if (response.ok) {
        return await response.json() as Ticket;
    } else await handleApiError(response);
}

async function editTicket(ticket: Ticket) {
    const response = await fetch(new URL(`tickets/${ticket.id}`, apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(ticket),
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

async function deleteTicket(ticketId: string) {
    const response = await fetch(new URL(`tickets/${ticketId}`, apiUrl), {
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

const ticketApis = {getTickets, getTicket, createTicket, closeTicket, editTicket, deleteTicket};
export default ticketApis;