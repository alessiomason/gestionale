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
    expenses: number        // additional expenses for the day

    constructor(
        user: User,
        date: string,
        workedHours: number,
        travelHours: number,
        holidayHours: number,
        sickHours: number,
        donationHours: number,
        furloughHours: number,
        expenses: number
    ) {
        this.user = user;
        this.date = date;
        this.workedHours = workedHours;
        this.travelHours = travelHours;
        this.holidayHours = holidayHours;
        this.sickHours = sickHours;
        this.donationHours = donationHours;
        this.furloughHours = furloughHours;
        this.expenses = expenses;
    }
}