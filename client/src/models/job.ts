import {User} from "./user";

export class Job {
    id: string
    subject: string
    client: string
    finalClient: string | undefined
    orderName: string | undefined
    orderAmount: number | undefined
    startDate: string | null
    deliveryDate: string | null
    notes: string
    active: boolean
    lost: boolean
    design: boolean
    construction: boolean
    totalWorkedHours: number

    constructor(
        id: string,
        subject: string,
        client: string,
        finalClient: string | undefined,
        orderName: string | undefined,
        orderAmount: number | undefined,
        startDate: string | null = null,
        deliveryDate: string | null = null,
        notes: string = "",
        active: boolean = true,
        lost: boolean = false,
        design: boolean = false,
        construction: boolean = false,
        totalWorkedHours: number = 0
    ) {
        this.id = id;
        this.subject = subject;
        this.client = client;
        this.finalClient = finalClient;
        this.orderName = orderName;
        this.orderAmount = orderAmount;
        this.startDate = startDate;
        this.deliveryDate = deliveryDate;
        this.notes = notes;
        this.active = active;
        this.lost = lost;
        this.design = design;
        this.construction = construction;
        this.totalWorkedHours = totalWorkedHours;
    }
}

export class JobUserHours {
    user: User
    hours: number
    cost: number

    constructor(user: User, hours: number, cost: number) {
        this.user = user;
        this.hours = hours;
        this.cost = cost;
    }
}

export class DetailedJob extends Job {
    totalCost: number
    userHours: JobUserHours[]

    constructor(
        id: string,
        subject: string,
        client: string,
        finalClient: string | undefined,
        orderName: string | undefined,
        orderAmount: number | undefined,
        startDate: string | null = null,
        deliveryDate: string | null = null,
        notes: string = "",
        active: boolean = true,
        lost: boolean = false,
        design: boolean = false,
        construction: boolean = false,
        totalWorkedHours: number = 0,
        totalCost: number = 0,
        userHours: JobUserHours[]
    ) {
        super(
            id,
            subject,
            client,
            finalClient,
            orderName,
            orderAmount,
            startDate,
            deliveryDate,
            notes,
            active,
            lost,
            design,
            construction,
            totalWorkedHours
        );
        this.totalCost = totalCost;
        this.userHours = userHours;
    }
}