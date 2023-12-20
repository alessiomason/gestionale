enum Role {
    dev = "dev",
    admin = "admin",
    user = "user"
}

enum Type {
    office = "office",
    workshop = "workshop"
}

export class NewUser {
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
    costPerKm: number | null

    constructor(
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
        costPerKm: number | null
    ) {
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

export class User extends NewUser {
    static readonly Role = Role;
    static readonly allRoles = [Role.user, Role.admin, Role.dev];
    static readonly Type = Type;
    static readonly allTypes = [Type.office, Type.workshop];

    id: number

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
        costPerKm: number | null
    ) {
        super(
            role,
            type,
            active,
            email,
            name,
            surname,
            phone,
            hoursPerDay,
            costPerHour,
            car,
            costPerKm
        );
        this.id = id;
    }
}