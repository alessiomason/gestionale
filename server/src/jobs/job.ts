export class Job {
    id: string
    subject: string
    client: string
    finalClient: string | undefined
    order: string | undefined
    orderAmount: number | undefined
    dueDate: string | null
    deliveryDate: string | null
    notes: string
    active: boolean
    lost: boolean
    design: boolean
    construction: boolean

    constructor(
        id: string,
        subject: string,
        client: string,
        finalClient: string | undefined,
        order: string | undefined,
        orderAmount: number | undefined,
        dueDate: string | null = null,
        deliveryDate: string | null = null,
        notes: string = "",
        active: boolean = true,
        lost: boolean = false,
        design: boolean = false,
        construction: boolean = false
    ) {
        this.id = id
        this.subject = subject
        this.client = client
        this.finalClient = finalClient
        this.order = order
        this.orderAmount = orderAmount
        this.dueDate = dueDate
        this.deliveryDate = deliveryDate
        this.notes = notes
        this.active = active
        this.lost = lost
        this.design = design
        this.construction = construction
    }
}