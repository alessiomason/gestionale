import {Job} from "./job";
import {User} from "./user";

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
    scheduledDeliveryDate: string | undefined
    partiallyClearedBy: User | undefined
    partialClearingDate: string | undefined
    clearedBy: User | undefined
    clearingDate: string | undefined

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
        this.scheduledDeliveryDate = scheduledDeliveryDate;
        this.partiallyClearedBy = partiallyClearedBy;
        this.partialClearingDate = partialClearingDate;
        this.clearedBy = clearedBy;
        this.clearingDate = clearingDate;
    }
}