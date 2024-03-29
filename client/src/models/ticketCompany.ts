export class TicketCompany {
    id: number
    name: string
    email: string | undefined
    contact: string | undefined
    usedHours: number
    remainingHours: number
    remainingHoursPercentage: number
    orderedHours: number

    constructor(
        id: number,
        name: string,
        email: string | undefined,
        contact: string | undefined,
        usedHours: number,
        orderedHours: number
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.contact = contact;
        this.usedHours = usedHours;
        const remainingHours = orderedHours - usedHours;
        this.remainingHours = remainingHours < 0 ? 0 : remainingHours;
        this.orderedHours = orderedHours;

        if (orderedHours !== 0) {
            this.remainingHoursPercentage = this.remainingHours / orderedHours * 100;
        } else {
            this.remainingHoursPercentage = 0;
        }
    }
}