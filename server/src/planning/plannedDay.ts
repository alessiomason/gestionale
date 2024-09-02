import {User} from "../users/user";
import {Job} from "../jobs/job";

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

export class RawPlannedDay {
    userId: number
    date: string
    jobId: string

    constructor(userId: number, date: string, jobId: string) {
        this.userId = userId;
        this.date = date;
        this.jobId = jobId;
    }
}