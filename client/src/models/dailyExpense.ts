export class DailyExpense {
    userId: number
    date: string
    expenses: number        // additional expenses for the day
    destination: string     // destination of work trip
    kms: number             // kms travelled for work trip
    tripCost?: number       // cost of trip = kms * cost of user per km, undefined if cost of user undefined
    travelHours: number     // hours of paid travel hours
    holidayHours: number    // hours of holiday or paid leave
    sickHours: number       // hours of sick leave
    donationHours: number   // hours of leave for blood donation
    furloughHours: number   // hours of furloughHours

    constructor(
        userId: number,
        date: string,
        expenses: number,
        destination: string,
        kms: number,
        tripCost: number | undefined,
        travelHours: number,
        holidayHours: number,
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
        this.sickHours = sickHours;
        this.donationHours = donationHours;
        this.furloughHours = furloughHours;
    }

    // The daily expense does not contain any valuable information, so it can be deleted.
    isEmpty() {
        return this.expenses === 0 &&
            this.destination === "" &&
            this.kms === 0 &&
            this.tripCost === 0 &&
            this.travelHours === 0 &&
            this.holidayHours === 0 &&
            this.sickHours === 0 &&
            this.donationHours === 0 &&
            this.furloughHours === 0
    }

    get(field: "expenses" | "kms" | "travelHours" | "holidayHours" | "sickHours" | "donationHours" | "furloughHours") {
        switch (field) {
            case "expenses":
                return this.expenses;
            case "kms":
                return this.kms;
            case "travelHours":
                return this.travelHours;
            case "holidayHours":
                return this.holidayHours;
            case "sickHours":
                return this.sickHours;
            case "donationHours":
                return this.donationHours;
            case "furloughHours":
                return this.furloughHours;
        }
    }

    set(
        field: "expenses" | "kms" | "travelHours" | "holidayHours" | "sickHours" | "donationHours" | "furloughHours",
        value: number
    ) {
        switch (field) {
            case "expenses":
                this.expenses = value;
                break;
            case "kms":
                this.kms = value;
                break;
            case "travelHours":
                this.travelHours = value;
                break;
            case "holidayHours":
                this.holidayHours = value;
                break;
            case "sickHours":
                this.sickHours = value;
                break;
            case "donationHours":
                this.donationHours = value;
                break;
            case "furloughHours":
                this.furloughHours = value;
                break;
        }
    }
}