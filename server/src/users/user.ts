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

    fullName() {
        return `${this.name} ${this.surname}`
    }

    username() {
        // replace whitespaces in name and surname with dashes, then lowercase
        const dashedName = this.name.replace(/\s/g, "-").toLowerCase()
        const dashedSurname = this.surname.replace(/\s/g, "-").toLowerCase()

        return `${dashedName}-${dashedSurname}`
    }

    constructor(
        role: Role,
        type: Type,
        name: string,
        surname: string,
        hoursPerDay: number,
        costPerHour: number,
        active = true,
        email: string | null = null,
        phone: string | null = null,
        car: string | null = null,
        costPerKm: number | null = null
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
        name: string,
        surname: string,
        hoursPerDay: number,
        costPerHour: number,
        active = true,
        email: string | null = null,
        phone: string | null = null,
        car: string | null = null,
        costPerKm: number | null = null
    ) {
        super(
            role,
            type,
            name,
            surname,
            hoursPerDay,
            costPerHour,
            active,
            email,
            phone,
            car,
            costPerKm
        );
        this.id = id;
    }
}