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

export class NewUser {
    role: Role
    type: Type
    active: boolean
    managesTickets: boolean
    email: string | null
    name: string
    surname: string
    username: string
    phone: string | null
    hoursPerDay: number
    costPerHour: number
    car: string | null
    costPerKm: number | null

    fullName() {
        return `${this.name} ${this.surname}`
    }

    static usernameFromName(name: string, surname: string) {
        // replace whitespaces in name and surname with dashes, then lowercase
        const dashedName = name.trim().replace(/\s/g, "-").toLowerCase()
        const dashedSurname = surname.trim().replace(/\s/g, "-").toLowerCase()

        return `${dashedName}-${dashedSurname}`
    }

    constructor(
        role: Role,
        type: Type,
        name: string,
        surname: string,
        username: string,
        hoursPerDay: number,
        costPerHour: number,
        active = true,
        managesTickets = false,
        email: string | null = null,
        phone: string | null = null,
        car: string | null = null,
        costPerKm: number | null = null
    ) {
        this.role = role;
        this.type = type;
        this.active = active;
        this.managesTickets = managesTickets;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.phone = phone;
        this.hoursPerDay = hoursPerDay;
        this.costPerHour = costPerHour;
        this.car = car;
        this.costPerKm = costPerKm;
    }
}

export class User extends NewUser {
    static readonly Role = Role;
    static readonly allRoles = [Role.user, Role.admin, Role.dev];
    static readonly Type = Type;
    static readonly allTypes = [Type.office, Type.workshop, Type.machine];

    id: number
    hashedPassword: Buffer | undefined
    salt: Buffer | undefined
    registrationToken: string | undefined
    tokenExpiryDate: string | undefined
    registrationDate: string | undefined

    constructor(
        id: number,
        role: Role,
        type: Type,
        name: string,
        surname: string,
        username: string,
        hashedPassword: Buffer | undefined,
        salt: Buffer | undefined,
        registrationToken: string | undefined,
        tokenExpiryDate: string | undefined,
        registrationDate: string | undefined,
        hoursPerDay: number,
        costPerHour: number,
        active = true,
        managesTickets = false,
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
            username,
            hoursPerDay,
            costPerHour,
            active,
            managesTickets,
            email,
            phone,
            car,
            costPerKm
        );
        this.id = id;
        this.hashedPassword = hashedPassword;
        this.salt = salt;
        this.registrationToken = registrationToken;
        this.tokenExpiryDate = tokenExpiryDate;
        this.registrationDate = registrationDate;
    }
}