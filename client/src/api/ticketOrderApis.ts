import {apiUrl} from "./apisValues";
import {TicketOrder} from "../models/ticketOrder";

async function getTicketOrders(ticketCompanyId: number) {
    const response = await fetch(new URL(`tickets/orders/company/${ticketCompanyId}`, apiUrl), {
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

async function getTicketOrder(ticketOrderId: string) {
    const response = await fetch(new URL(`tickets/orders/${ticketOrderId}`, apiUrl), {
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

async function createTicketOrder(ticketOrder: TicketOrder) {
    const response = await fetch(new URL("tickets/orders", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(ticketOrder),
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
}

async function deleteTicketOrder(ticketId: string) {
    const response = await fetch(new URL(`tickets/orders/${ticketId}`, apiUrl), {
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

const ticketOrderApis = {getTicketOrders, getTicketOrder, createTicketOrder, deleteTicketOrder};
export default ticketOrderApis;