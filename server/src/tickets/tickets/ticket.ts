import {TicketCompany} from "../ticketCompanies/ticketCompany";

export class Ticket {
    id: number
    company: TicketCompany
    title: string
    description: string
    startTime: string
    paused: boolean
    resumeTime?: string
    durationBeforePause: number
    endTime?: string

    constructor(
        id: number,
        company: TicketCompany,
        title: string,
        description: string,
        startTime: string,
        paused: boolean = false,
        resumeTime?: string,
        durationBeforePause: number = 0,
        endTime?: string
    ) {
        this.id = id;
        this.company = company;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.paused = paused;
        this.resumeTime = resumeTime;
        this.durationBeforePause = durationBeforePause;
        this.endTime = endTime;
    }
}