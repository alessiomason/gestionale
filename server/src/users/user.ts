enum Role {
    dev,
    admin,
    user
}

enum Type {
    office,
    workshop
}

export class User {
    static readonly Role = Role;
    static readonly Type = Type

    id: number
    role: Role
    type: Type
    active: boolean
    email: string | null
    name: string
    surname: string
    phone: string | null
    hoursPerDay: number
    costPerHour: number
    car: string | null
    costPerKm: string | null

    constructor(
        id: number,
        role: Role,
        type: Type,
        active = true,
        email: string | null,
        name: string,
        surname: string,
        phone: string | null,
        hoursPerDay: number,
        costPerHour: number,
        car: string | null,
        costPerKm: string | null
    ) {
        this.id = id
        this.role = role
        this.type = type
        this.active = active
        this.email = email
        this.name = name
        this.surname = surname
        this.phone = phone
        this.hoursPerDay = hoursPerDay
        this.costPerHour = costPerHour
        this.car = car
        this.costPerKm = costPerKm
    }
}