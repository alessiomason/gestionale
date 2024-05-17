import {Job} from "../jobs/job";
import {User} from "../users/user";

export class Order {
    id: number
    year: number
    date: string
    job: Job
    supplier: string
    description: string
    by: User
    uploadedFile: boolean
    scheduledDeliveryDate?: string
    clearedBy?: User
    clearingDate?: string

    constructor(
        id: number,
        year: number,
        date: string,
        job: Job,
        supplier: string,
        description: string,
        by: User,
        uploadedFile: boolean,
        scheduledDeliveryDate?: string,
        clearedBy?: User,
        clearingDate?: string
    ) {
        this.id = id;
        this.year = year;
        this.date = date;
        this.job = job;
        this.supplier = supplier;
        this.description = description;
        this.by = by;
        this.uploadedFile = uploadedFile;
        this.scheduledDeliveryDate = scheduledDeliveryDate;
        this.clearedBy = clearedBy;
        this.clearingDate = clearingDate;
    }
}

export class NewOrder {
    id: number
    year: number
    date: string
    jobId: string
    supplier: string
    description: string
    byId: number
    scheduledDeliveryDate?: string
    clearedById?: number
    clearingDate?: string

    constructor(
        id: number,
        year: number,
        date: string,
        jobId: string,
        supplier: string,
        description: string,
        byId: number,
        scheduledDeliveryDate?: string,
        clearedById?: number,
        clearingDate?: string
    ) {
        this.id = id;
        this.year = year;
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