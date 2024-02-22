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

        // if no ordered hours, usedHoursProgress is maxed out
        const progress = totalOrderedHours === 0 ? 100 : totalUsedHours/totalOrderedHours * 100;

        return new TicketCompanyWithProgress(this.id, this.name, progress);
    }
}

export class TicketCompanyWithProgress extends TicketCompany {
    usedHoursProgress: number

    constructor(id: number, name: string, usedHoursProgress: number) {
        super(id, name);
        this.usedHoursProgress = usedHoursProgress;
    }
}