export enum Role {
    dev = "dev",
    admin = "admin",
    user = "user"
}

export enum Type {
    office = "office",
    workshop = "workshop",
    machine = "machine"
}

export class User {
    static readonly Role = Role;
    static readonly allRoles = [Role.user, Role.admin, Role.dev];
    static readonly Type = Type;
    static readonly allTypes = [Type.office, Type.workshop, Type.machine];

    id: number
    role: Role
    type: Type
    active: boolean
    managesTickets: boolean
    managesOrders: boolean
    email: string | undefined
    name: string
    surname: string
    username: string
    registrationToken: string | undefined
    tokenExpiryDate: string | undefined
    registrationDate: string | undefined
    phone: string | undefined
    hoursPerDay: number
    costPerHour: number
    car: string | undefined
    costPerKm: number | undefined

    constructor(
        id: number,
        role: Role,
        type: Type,
        name: string,
        surname: string,
        username: string,
        registrationToken: string | undefined,
        tokenExpiryDate: string | undefined,
        registrationDate: string | undefined,
        hoursPerDay: number,
        costPerHour: number,
        active = true,
        managesTickets = false,
        managesOrders = false,
        email: string | undefined = undefined,
        phone: string | undefined = undefined,
        car: string | undefined = undefined,
        costPerKm: number | undefined = undefined
    ) {
        this.id = id;
        this.role = role;
        this.type = type;
        this.active = active;
        this.managesTickets = managesTickets;
        this.managesOrders = managesOrders;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.registrationToken = registrationToken;
        this.tokenExpiryDate = tokenExpiryDate;
        this.registrationDate = registrationDate;
        this.phone = phone;
        this.hoursPerDay = hoursPerDay;
        this.costPerHour = costPerHour;
        this.car = car;
        this.costPerKm = costPerKm;
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
            case Type.machine:
                return "Macchina";
        }
    }

    static usernameFromName(name: string, surname: string) {
        // replace whitespaces in name and surname with dashes, then lowercase
        const dashedName = name.trim().replace(/\s/g, "-").toLowerCase()
        const dashedSurname = surname.trim().replace(/\s/g, "-").toLowerCase()

        return `${dashedName}-${dashedSurname}`
    }
}