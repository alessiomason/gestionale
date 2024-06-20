import {getTicketOrders} from "../ticketOrders/ticketOrderService";
import {getTickets} from "../tickets/ticketService";
import dayjs from "dayjs";

export class TicketCompany {
    id: number
    name: string
    email?: string
    contact?: string

    constructor(id: number, name: string, email?: string, contact?: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.contact = contact;
    }

    async attachProgress() {
        const ticketOrders = await getTicketOrders(this.id);
        const tickets = await getTickets(this.id);

        const totalOrderedHours = ticketOrders
            .map(ticketOrder => ticketOrder.hours)
            .reduce(((sum, ticketOrderHours) => sum + ticketOrderHours), 0);

        const totalUsedHours = tickets
            .map(ticket => dayjs.duration(ticket.duration))
            .reduce(((sum, ticketDuration) => sum.add(ticketDuration)), dayjs.duration(0))
            .asHours();

        return new TicketCompanyWithProgress(
            this.id,
            this.name,
            this.email,
            this.contact,
            totalUsedHours,
            totalOrderedHours,
            tickets.length
        );
    }
}

export class TicketCompanyWithProgress extends TicketCompany {
    usedHours: number
    orderedHours: number
    nTickets: number

    constructor(
        id: number,
        name: string,
        email: string | undefined,
        contact: string | undefined,
        usedHours: number,
        orderedHours: number,
        nTickets: number
    ) {
        super(id, name, email, contact);
        this.usedHours = usedHours;
        this.orderedHours = orderedHours;
        this.nTickets = nTickets;
    }
}