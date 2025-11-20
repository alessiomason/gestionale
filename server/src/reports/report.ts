import {User} from "../users/user";
import {Job} from "../jobs/job";
import {ReportWorkingDay} from "./reportWorkingDay";

export enum ReportVehicle {
    companyCar = "company_car",
    transitVan = "transit_van",
    jumpyVan = "jumpy_van",
    ownVehicle = "own_vehicle",
    rentalVehicle = "rental_vehicle"
}

export enum ReportExpenses {
    justified = "justified",
    customerExpense = "customer_expense",
    noExpense = "no_expense"
}

export class Report {
    id: number
    operator: User
    date: string
    job: Job
    address: string
    machine: string
    jobsDone: string
    jobsToBeDone: string
    reportVehicle: ReportVehicle
    reportExpenses: ReportExpenses
    supplyIncludesIntervention: boolean
    workingDays: ReportWorkingDay[]

    constructor(
        id: number,
        operator: User,
        date: string,
        job: Job,
        address: string,
        machine: string,
        jobsDone: string,
        jobsToBeDone: string,
        reportVehicle: ReportVehicle,
        reportExpenses: ReportExpenses,
        supplyIncludesIntervention: boolean,
        workingDays: ReportWorkingDay[]
    ) {
        this.id = id;
        this.operator = operator;
        this.date = date;
        this.job = job;
        this.address = address;
        this.machine = machine;
        this.jobsDone = jobsDone;
        this.jobsToBeDone = jobsToBeDone;
        this.reportVehicle = reportVehicle;
        this.reportExpenses = reportExpenses;
        this.supplyIncludesIntervention = supplyIncludesIntervention;
        this.workingDays = workingDays;
    }
}