import {apiUrl} from "./apisValues";
import {Ticket} from "../models/ticket";
import {handleApiError} from "./handleApiError";

// The passed-in ticket was built from a json, this function returns a properly built Ticket.
function rebuildTicket(ticket: Ticket) {
    return new Ticket(
        ticket.id,
        ticket.company,
        ticket.title,
        ticket.description,
        ticket.startTime,
        ticket.paused,
        ticket.resumeTime,
        ticket.durationBeforePause,
        ticket.endTime
    );
}

async function getTickets(ticketCompanyId: number) {
    const response = await fetch(new URL(`tickets/company/${ticketCompanyId}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        const tickets = await response.json() as Ticket[];
        return tickets.map(ticket => rebuildTicket(ticket));
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
        const ticket = await response.json() as Ticket;
        return rebuildTicket(ticket);
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
        const ticket = await response.json() as Ticket;
        return rebuildTicket(ticket);
    } else await handleApiError(response);
}

async function pauseResumeTicket(ticketId: number) {
    const response = await fetch(new URL(`tickets/${ticketId}/pause`, apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        const ticket = await response.json() as Ticket;
        return rebuildTicket(ticket);
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
        body: JSON.stringify(body)
    });
    if (response.ok) {
        const ticket = await response.json() as Ticket;
        return rebuildTicket(ticket);
    } else await handleApiError(response);
}

async function editTicket(ticket: Ticket) {
    const response = await fetch(new URL(`tickets/${ticket.id}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(ticket),
    });
    if (response.ok) {
        const ticket = await response.json() as Ticket;
        return rebuildTicket(ticket);
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

const ticketApis = {getTickets, getTicket, createTicket, pauseResumeTicket, closeTicket, editTicket, deleteTicket};
export default ticketApis;