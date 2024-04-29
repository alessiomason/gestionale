import {TicketCompany} from "./ticketCompany";

export class TicketOrder {
    id: number
    company: TicketCompany
    hours: number
    date: string

    constructor(id: number, company: TicketCompany, hours: number, date: string) {
        this.id = id;
        this.company = company;
        this.hours = hours;
        this.date = date;
    }
}

export class NewTicketOrder {
    company: TicketCompany
    hours: number

    constructor(company: TicketCompany, hours: number) {
        this.company = company;
        this.hours = hours;
    }
}