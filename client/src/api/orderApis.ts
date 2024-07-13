import {apiUrl} from "./apisValues";
import {handleApiError} from "./handleApiError";
import {Order} from "../models/order";

// The passed-in order was built from a json, this function returns a properly built Order.
function rebuildOrder(order: Order) {
    return new Order(
        order.id,
        order.year,
        order.date,
        order.job,
        order.supplier,
        order.description,
        order.cancelled,
        order.by,
        order.uploadedFile,
        order.scheduledDeliveryDate,
        order.partiallyClearedBy,
        order.partialClearingDate,
        order.clearedBy,
        order.clearingDate
    );
}

async function getAllOrders() {
    const response = await fetch(new URL("orders", apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        const orders = await response.json() as Order[];
        return orders.map(order => rebuildOrder(order));
    } else await handleApiError(response);
}

async function getOrder(orderId: number, year: number) {
    const response = await fetch(new URL(`orders/${year}/${orderId}`, apiUrl), {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        const order = await response.json() as Order;
        return rebuildOrder(order);
    } else await handleApiError(response);
}

async function createOrder(order: Order) {
    const newOrder = {
        id: order.id,
        year: order.year,
        date: order.date === "" ? undefined : order.date,
        jobId: order.job.id,
        supplier: order.supplier,
        description: order.description,
        scheduledDeliveryDate: order.scheduledDeliveryDate === "" ? undefined : order.scheduledDeliveryDate,
        clearingDate: order.clearingDate === "" ? undefined : order.clearingDate
    };

    const response = await fetch(new URL("orders", apiUrl), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newOrder)
    });
    if (response.ok) {
        const order = await response.json() as Order;
        return rebuildOrder(order);
    } else await handleApiError(response);
}

async function updateOrder(id: number, year: number, order: Order) {
    const updatedOrder = {
        id: order.id,
        year: order.year,
        date: order.date === "" ? undefined : order.date,
        jobId: order.job.id,
        supplier: order.supplier,
        description: order.description,
        byId: order.by.id,
        scheduledDeliveryDate: order.scheduledDeliveryDate === "" ? undefined : order.scheduledDeliveryDate,
        clearedById: order.clearedBy?.id,
        clearingDate: order.clearingDate === "" ? undefined : order.clearingDate
    };

    const response = await fetch(new URL(`orders/${year}/${id}`, apiUrl), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(updatedOrder)
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

async function cancelOrder(order: Order, cancelled: boolean) {
    const response = await fetch(new URL(`orders/${order.year}/${order.id}/cancel`, apiUrl), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({cancelled})
    });
    if (response.ok) {
        const order = await response.json() as Order;
        return rebuildOrder(order);
    } else await handleApiError(response);
}

async function clearOrder(order: Order, partially: boolean = false) {
    const response = await fetch(new URL(`orders/${order.year}/${order.id}/clear`, apiUrl), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({partially})
    });
    if (response.ok) {
        const order = await response.json() as Order;
        return rebuildOrder(order);
    } else await handleApiError(response);
}

async function unclearOrder(order: Order, partially: boolean = false) {
    const response = await fetch(new URL(`orders/${order.year}/${order.id}/unclear`, apiUrl), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({partially})
    });
    if (response.ok) {
        const order = await response.json() as Order;
        return rebuildOrder(order);
    } else await handleApiError(response);
}

async function uploadedOrderFile(order: Order) {
    const response = await fetch(new URL(`orders/${order.year}/${order.id}/file`, apiUrl), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    if (response.ok) {
        return true;
    } else await handleApiError(response);
}

async function deleteOrder(id: number, year: number) {
    const response = await fetch(new URL(`orders/${year}/${id}`, apiUrl), {
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

const orderApis = {
    getAllOrders,
    getOrder,
    createOrder,
    updateOrder,
    cancelOrder,
    clearOrder,
    unclearOrder,
    uploadedOrderFile,
    deleteOrder
};
export default orderApis;