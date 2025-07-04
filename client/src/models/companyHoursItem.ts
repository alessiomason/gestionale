import {User} from "./user";

export class CompanyHoursItem {
    user: User
    date: string
    workedHours: number
    travelHours: number     // hours of paid travel hours
    holidayHours: number    // hours of holiday or paid leave
    sickHours: number       // hours of sick leave
    donationHours: number   // hours of leave for blood donation
    furloughHours: number   // hours of furlough
    bereavementHours: number
    paternityHours: number  // hours of paternity leave
    expenses: number        // additional expenses for the day
    kms: number             // kms travelled for work trip
    destination: string     // destination of work trip
    tripCost?: number       // cost of trip = kms * cost of user per km, undefined if cost of user undefined

    constructor(
        user: User,
        date: string,
        workedHours: number,
        travelHours: number,
        holidayHours: number,
        sickHours: number,
        donationHours: number,
        furloughHours: number,
        bereavementHours: number,
        paternityHours: number,
        expenses: number,
        kms: number,
        destination: string,
        tripCost?: number
    ) {
        this.user = user;
        this.date = date;
        this.workedHours = workedHours;
        this.travelHours = travelHours;
        this.holidayHours = holidayHours;
        this.sickHours = sickHours;
        this.donationHours = donationHours;
        this.furloughHours = furloughHours;
        this.bereavementHours = bereavementHours;
        this.paternityHours = paternityHours;
        this.expenses = expenses;
        this.kms = kms;
        this.destination = destination;
        this.tripCost = tripCost;
    }
}