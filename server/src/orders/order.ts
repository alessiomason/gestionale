import {Job} from "../jobs/job";
import {User} from "../users/user";

export class Order {
    id: number
    year: number
    name: string
    date: string
    job: Job
    supplier: string
    description: string
    by: User
    uploadedFile: boolean
    notifiedExpiry: boolean     // if expired, an email has been sent to notify of the expiry
    scheduledDeliveryDate?: string
    partiallyClearedBy?: User
    partialClearingDate?: string
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
        notifiedExpiry: boolean = false,
        scheduledDeliveryDate?: string,
        partiallyClearedBy?: User,
        partialClearingDate?: string,
        clearedBy?: User,
        clearingDate?: string
    ) {
        this.id = id;
        this.year = year;
        this.name = `${id}/${year.toString().substring(2)}`;
        this.date = date;
        this.job = job;
        this.supplier = supplier;
        this.description = description;
        this.by = by;
        this.uploadedFile = uploadedFile;
        this.notifiedExpiry = notifiedExpiry;
        this.scheduledDeliveryDate = scheduledDeliveryDate;
        this.partiallyClearedBy = partiallyClearedBy;
        this.partialClearingDate = partialClearingDate;
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
    partiallyClearedById?: number
    partialClearingDate?: string
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
        partiallyClearedById?: number,
        partialClearingDate?: string,
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
        this.partiallyClearedById = partiallyClearedById;
        this.partialClearingDate = partialClearingDate;
        this.clearedById = clearedById;
        this.clearingDate = clearingDate;
    }
}