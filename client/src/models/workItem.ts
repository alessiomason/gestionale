import {Job} from "./job";
import {User} from "./user";

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

export class MonthWorkItem {
    user: User
    job: Job
    month: string
    totalHours: number

    constructor(user: User, job: Job, month: string, totalHours: number) {
        this.user = user;
        this.job = job;
        this.month = month;
        this.totalHours = totalHours;
    }
}