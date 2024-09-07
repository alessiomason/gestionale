import {User} from "./user";
import {Job} from "./job";

export class PlannedDay {
    user: User
    date: string
    job: Job

    constructor(user: User, date: string, job: Job) {
        this.user = user;
        this.date = date;
        this.job = job;
    }
}