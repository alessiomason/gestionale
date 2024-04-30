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
    scheduledDeliveryDate: string | undefined
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
        scheduledDeliveryDate: string | undefined = undefined,
        clearedBy: User | undefined = undefined,
        clearingDate: string | undefined = undefined
    ) {
        this.id = id;
        this.year = year;
        this.name = `${id}/${year.toString().substring(2)}`;
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