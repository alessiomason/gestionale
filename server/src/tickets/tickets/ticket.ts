import {TicketCompany} from "../ticketCompanies/ticketCompany";

export class Ticket {
    id: number
    company: TicketCompany
    title: string
    description: string
    startTime: string
    endTime: string

    constructor(
        id: number,
        company: TicketCompany,
        title: string,
        description: string,
        startTime: string,
        endTime: string
    ) {
        this.id = id;
        this.company = company;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}