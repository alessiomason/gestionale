export class DailyExpense {
    userId: number
    date: string
    expenses: number        // additional expenses for the day
    destination: string     // destination of work trip
    kms: number             // kms travelled for work trip
    tripCost?: number       // cost of trip = kms * cost of user per km, undefined if cost of user undefined
    travelHours: number     // hours of paid travel hours
    holidayHours: number    // hours of holiday or paid leave
    holidayApproved: boolean | null    // holiday approved or rejected by the administrator or pending
    sickHours: number       // hours of sick leave
    donationHours: number   // hours of leave for blood donation
    furloughHours: number   // hours of furlough

    constructor(
        userId: number,
        date: string,
        expenses: number,
        destination: string,
        kms: number,
        tripCost: number | undefined,
        travelHours: number,
        holidayHours: number,
        holidayApproved: boolean | null,
        sickHours: number,
        donationHours: number,
        furloughHours: number
    ) {
        this.userId = userId;
        this.date = date;
        this.expenses = expenses;
        this.destination = destination;
        this.kms = kms;
        this.tripCost = tripCost;
        this.travelHours = travelHours;
        this.holidayHours = holidayHours;
        this.holidayApproved = holidayApproved;
        this.sickHours = sickHours;
        this.donationHours = donationHours;
        this.furloughHours = furloughHours;
    }

    // The daily expense does not contain any valuable information, so it can be deleted.
    isEmpty() {
        return this.expenses === 0 &&
            this.destination === "" &&
            this.kms === 0 &&
            (this.tripCost === 0 || this.tripCost == undefined) &&
            this.travelHours === 0 &&
            this.holidayHours === 0 &&
            this.sickHours === 0 &&
            this.donationHours === 0 &&
            this.furloughHours === 0
    }
}