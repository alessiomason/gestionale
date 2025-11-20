export class ReportWorkingDay {
    date: string
    morningStartTime: string
    morningEndTime: string
    afternoonStartTime: string
    afternoonEndTime: string
    hours: number
    travelHours: number
    kms: number

    constructor(
        date: string,
        morningStartTime: string,
        morningEndTime: string,
        afternoonStartTime: string,
        afternoonEndTime: string,
        hours: number,
        travelHours: number,
        kms: number
    ) {
        this.date = date;
        this.morningStartTime = morningStartTime;
        this.morningEndTime = morningEndTime;
        this.afternoonStartTime = afternoonStartTime;
        this.afternoonEndTime = afternoonEndTime;
        this.hours = hours;
        this.travelHours = travelHours;
        this.kms = kms;
    }
}