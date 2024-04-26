import {apiUrl} from "./apisValues";
import {handleApiError} from "./handleApiError";
import {Order} from "../models/order";

async function getAllOrders() {
    const response = await fetch(new URL("orders", apiUrl), {
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

async function getOrder(orderId: string) {
    const response = await fetch(new URL(`orders/${orderId}`, apiUrl), {
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

async function createOrder(order: Order) {
    const newOrder = {
        date: order.date === "" ? undefined : order.date,
        jobId: order.job.id,
        supplier: order.supplier,
        description: order.description,
        byId: order.by.id,
        scheduledDeliveryDate: order.scheduledDeliveryDate === "" ? undefined : order.scheduledDeliveryDate,
        clearedById: order.clearedBy?.id,
        clearingDate: order.clearingDate === "" ? undefined : order.clearingDate
    };

    const response = await fetch(new URL("orders", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newOrder),
    });
    if (response.ok) {
        return await response.json();
    } else await handleApiError(response);
}

const orderApis = {getAllOrders, getOrder, createOrder};
export default orderApis;