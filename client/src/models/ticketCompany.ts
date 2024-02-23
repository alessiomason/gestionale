export class TicketCompany {
    id: number
    name: string
    usedHours: number
    remainingHours: number
    remainingHoursPercentage: number
    orderedHours: number

    constructor(id: number, name: string, usedHours: number, orderedHours: number) {
        this.id = id;
        this.name = name;
        this.usedHours = usedHours;
        this.remainingHours = orderedHours - usedHours;
        this.orderedHours = orderedHours;

        if (orderedHours !== 0) {
            this.remainingHoursPercentage = this.remainingHours / orderedHours * 100;
        } else {
            this.remainingHoursPercentage = 0;
        }
    }
}