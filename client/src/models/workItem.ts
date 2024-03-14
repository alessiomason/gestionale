import {Job} from "./job";

export class WorkItem {
    userId: number
    job: Job
    date: string
    hours: number

    constructor(userId: number, job: Job, date: string, hours: number) {
        this.userId = userId;
        this.job = job;
        this.date = date;
        this.hours = hours;
    }
}