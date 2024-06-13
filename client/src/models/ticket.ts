import {TicketCompany} from "./ticketCompany";
import dayjs from "dayjs";

export class Ticket {
    id: number
    company: TicketCompany
    title: string
    description: string
    startTime?: string
    paused: boolean
    resumeTime?: string
    durationBeforePause?: number
    endTime?: string
    duration: number

    constructor(
        id: number,
        company: TicketCompany,
        title: string,
        description: string,
        startTime?: string,
        paused: boolean = false,
        resumeTime?: string,
        durationBeforePause?: number,
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
        if (paused) {
            this.duration = durationBeforePause ?? 0;
        } else {
            this.duration = (durationBeforePause ?? 0) + dayjs.duration(dayjs(endTime).diff(dayjs(resumeTime ?? startTime))).asMilliseconds();
        }
    }
}