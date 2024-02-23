import {getTicketOrders} from "../ticketOrders/ticketOrderService";
import {getTickets} from "../tickets/ticketService";
import dayjs from "dayjs";

export class TicketCompany {
    id: number
    name: string

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    async attachProgress() {
        const ticketOrders = await getTicketOrders(this.id);
        const tickets = await getTickets(this.id);

        const totalOrderedHours = ticketOrders
            .map(ticketOrder => ticketOrder.hours)
            .reduce(((sum, ticketOrderHours) => sum + ticketOrderHours), 0)

        const totalUsedHours = tickets
            .map(ticket => dayjs.duration(dayjs(ticket.endTime).diff(dayjs(ticket.startTime))))
            .reduce(((sum, ticketDuration) => sum.add(ticketDuration)), dayjs.duration(0))
            .asHours()

        return new TicketCompanyWithProgress(this.id, this.name, totalUsedHours, totalOrderedHours);
    }
}

export class TicketCompanyWithProgress extends TicketCompany {
    usedHours: number
    orderedHours: number

    constructor(id: number, name: string, usedHours: number, orderedHours: number) {
        super(id, name);
        this.usedHours = usedHours;
        this.orderedHours = orderedHours;
    }
}