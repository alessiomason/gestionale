export class TicketCompany {
    id: number
    name: string
    usedHoursProgress: number

    constructor(id: number, name: string, usedHoursProgress: number) {
        this.id = id;
        this.name = name;
        this.usedHoursProgress = usedHoursProgress;
    }
}