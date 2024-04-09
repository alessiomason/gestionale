import {Job} from "./job";
import {User} from "./user";

export class WorkItem {
    userId: number
    job: Job
    date: string
    hours: number
    cost?: number   // hours * user.costPerHour, saved as costPerHour might change throughout time

    constructor(userId: number, job: Job, date: string, hours: number, cost?: number) {
        this.userId = userId;
        this.job = job;
        this.date = date;
        this.hours = hours;
        this.cost = cost;
    }
}

export class MonthWorkItem {
    user: User
    job: Job
    month: string
    totalHours: number
    totalCost?: number  // totalHours * user.costPerHour, saved as costPerHour might change throughout time

    constructor(user: User, job: Job, month: string, totalHours: number, totalCost?: number) {
        this.user = user;
        this.job = job;
        this.month = month;
        this.totalHours = totalHours;
        this.totalCost = totalCost;
    }
}