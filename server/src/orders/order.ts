import {Job} from "../jobs/job";
import {User} from "../users/user";

export class Order {
    id: number
    date: string
    job: Job
    supplier: string
    description: string
    by: User
    scheduledDeliveryDate: string | undefined
    clearedBy: User | undefined
    clearingDate: string | undefined

    constructor(
        id: number,
        date: string,
        job: Job,
        supplier: string,
        description: string,
        by: User,
        scheduledDeliveryDate: string | undefined = undefined,
        clearedBy: User | undefined = undefined,
        clearingDate: string | undefined = undefined
    ) {
        this.id = id;
        this.date = date;
        this.job = job;
        this.supplier = supplier;
        this.description = description;
        this.by = by;
        this.scheduledDeliveryDate = scheduledDeliveryDate;
        this.clearedBy = clearedBy;
        this.clearingDate = clearingDate;
    }
}

export class NewOrder {
    date: string
    jobId: string
    supplier: string
    description: string
    byId: number
    scheduledDeliveryDate: string | undefined
    clearedById: number | undefined
    clearingDate: string | undefined

    constructor(
        date: string,
        jobId: string,
        supplier: string,
        description: string,
        byId: number,
        scheduledDeliveryDate: string | undefined = undefined,
        clearedById: number | undefined = undefined,
        clearingDate: string | undefined = undefined
    ) {
        this.date = date;
        this.jobId = jobId;
        this.supplier = supplier;
        this.description = description;
        this.byId = byId;
        this.scheduledDeliveryDate = scheduledDeliveryDate;
        this.clearedById = clearedById;
        this.clearingDate = clearingDate;
    }
}