enum Role {
    dev = "dev",
    admin = "admin",
    user = "user"
}

enum Type {
    office = "office",
    workshop = "workshop"
}

export class User {
    static readonly Role = Role;
    static readonly allRoles = [Role.user, Role.admin, Role.dev];
    static readonly Type = Type;
    static readonly allTypes = [Type.office, Type.workshop];

    id: number
    role: Role
    type: Type
    active: boolean
    email: string | null
    name: string
    surname: string
    username: string
    registrationToken: string | undefined
    phone: string | null
    hoursPerDay: number
    costPerHour: number
    car: string | null
    costPerKm: number | null

    constructor(
        id: number,
        role: Role,
        type: Type,
        name: string,
        surname: string,
        username: string,
        registrationToken: string | undefined,
        hoursPerDay: number,
        costPerHour: number,
        active = true,
        email: string | null = null,
        phone: string | null = null,
        car: string | null = null,
        costPerKm: number | null = null
    ) {
        this.id = id
        this.role = role
        this.type = type
        this.active = active
        this.email = email
        this.name = name
        this.surname = surname
        this.username = username
        this.registrationToken = registrationToken;
        this.phone = phone
        this.hoursPerDay = hoursPerDay
        this.costPerHour = costPerHour
        this.car = car
        this.costPerKm = costPerKm
    }

    static roleName(role: Role) {
        switch (role) {
            case Role.dev:
                return "Sviluppatore";
            case Role.admin:
                return "Amministratore";
            case Role.user:
                return "Utente";
        }
    }

    static typeName(type: Type) {
        switch (type) {
            case Type.office:
                return "Ufficio";
            case Type.workshop:
                return "Officina";
        }
    }
}