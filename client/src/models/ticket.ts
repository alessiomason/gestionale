import {TicketCompany} from "./ticketCompany";

export class Ticket {
    id: number
    company: TicketCompany
    title: string
    description: string
    startTime: string | undefined
    endTime: string | undefined

    constructor(
        id: number,
        company: TicketCompany,
        title: string,
        description: string,
        startTime?: string,
        endTime?: string
    ) {
        this.id = id;
        this.company = company;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}