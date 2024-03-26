import {knex} from '../database/db';
import {NewUser, Role, Type, User} from "./user";
import {UserNotFound, UserWithSameUsernameError} from "./userErrors";
import * as crypto from "crypto";
import dayjs from "dayjs";

export async function getAllUsers() {
    const users = await knex("users").select();

    return users.map(user => {
        return new User(
            user.id,
            user.role,
            user.type,
            user.name,
            user.surname,
            user.username,
            undefined,
            undefined,
            user.registrationToken,
            user.tokenExpiryDate,
            user.registrationDate,
            parseFloat(user.hoursPerDay),
            parseFloat(user.costPerHour),
            user.active,
            user.managesTickets,
            user.email,
            user.phone,
            user.car,
            parseFloat(user.costPerKm)
        )
    })
}

export async function getAllMachineUsers() {
    const machineUsers = await knex("users")
        .where("type", "machine")
        .andWhere({active: true})
        .select();

    return machineUsers.map(user => {
        return new User(
            user.id,
            user.role,
            user.type,
            user.name,
            user.surname,
            user.username,
            undefined,
            undefined,
            user.registrationToken,
            user.tokenExpiryDate,
            user.registrationDate,
            parseFloat(user.hoursPerDay),
            parseFloat(user.costPerHour),
            user.active,
            user.managesTickets,
            user.email,
            user.phone,
            user.car,
            parseFloat(user.costPerKm)
        )
    })
}

export async function getUser(id: number) {
    const user = await knex("users")
        .first()
        .where({id: id})

    if (!user) return

    return new User(
        user.id,
        user.role,
        user.type,
        user.name,
        user.surname,
        user.username,
        undefined,
        undefined,
        undefined,
        undefined,
        user.registrationDate,
        parseFloat(user.hoursPerDay),
        parseFloat(user.costPerHour),
        user.active,
        user.managesTickets,
        user.email,
        user.phone,
        user.car,
        parseFloat(user.costPerKm)
    )
}

export async function getFullUser(id: number) {
    const user = await knex<User>("users")
        .first()
        .where({id: id})

    if (!user) return

    return new User(
        user.id,
        user.role,
        user.type,
        user.name,
        user.surname,
        user.username,
        user.hashedPassword,
        user.salt,
        user.registrationToken,
        user.tokenExpiryDate,
        user.registrationDate,
        user.hoursPerDay,
        user.costPerHour,
        user.active,
        user.managesTickets,
        user.email,
        user.phone,
        user.car,
        user.costPerKm
    )
}

export async function getUserFromUsername(username: string) {
    const user = await knex<User>("users")
        .first()
        .where({username: username})

    if (!user) return

    return new User(
        user.id,
        user.role,
        user.type,
        user.name,
        user.surname,
        user.username,
        user.hashedPassword,
        user.salt,
        undefined,
        undefined,
        user.registrationDate,
        user.hoursPerDay,
        user.costPerHour,
        user.active,
        user.managesTickets,
        user.email,
        user.phone,
        user.car,
        user.costPerKm
    )
}

export async function getUserFromRegistrationToken(registrationToken: string) {
    const user = await knex<User>("users")
        .first()
        .where({registrationToken: registrationToken})

    if (!user) return

    return new User(
        user.id,
        user.role,
        user.type,
        user.name,
        user.surname,
        user.username,
        user.hashedPassword,
        user.salt,
        user.registrationToken,
        user.tokenExpiryDate,
        user.registrationDate,
        user.hoursPerDay,
        user.costPerHour,
        user.active,
        user.managesTickets,
        user.email,
        user.phone,
        user.car,
        user.costPerKm
    )
}

export async function getPublicKeyIdFromUsername(username: string) {
    const publicKeyId = await knex("public_key_credentials")
        .join("users", "public_key_credentials.user_id", "users.id")
        .first("public_key_credentials.public_key_id")
        .where({username: username})

    if (!publicKeyId)
        return new UserNotFound()

    return publicKeyId
}

export async function createUser(newUser: NewUser) {
    const existingUser = await knex<User>("users")
        .first()
        .where({name: newUser.name, surname: newUser.surname})

    if (existingUser) {
        return new UserWithSameUsernameError()
    }

    const registrationToken = crypto.randomBytes(8).toString("hex");
    const tokenExpiryDate = dayjs().add(30, "days").format();  // expiry date is in 30 days

    const userToInsert = {
        ...newUser,
        registrationToken: registrationToken,
        tokenExpiryDate: tokenExpiryDate
    }

    const userIds = await knex("users")
        .returning("id")
        .insert(userToInsert);

    return new User(
        userIds[0],
        newUser.role,
        newUser.type,
        newUser.name,
        newUser.surname,
        newUser.username,
        undefined,
        undefined,
        registrationToken,
        tokenExpiryDate,
        undefined,
        newUser.hoursPerDay,
        newUser.costPerHour,
        newUser.active,
        newUser.managesTickets,
        newUser.email,
        newUser.phone,
        newUser.car,
        newUser.costPerKm
    )
}

// `undefined` values are skipped, not updated
export async function updateUser(
    id: number,
    active: boolean | undefined,
    managesTickets: boolean | undefined,
    role: Role | undefined,
    type: Type | undefined,
    registrationDate: string | undefined,
    hoursPerDay: number | undefined,
    costPerHour: number | undefined,
    email: string | undefined,
    phone: string | undefined,
    car: string | undefined,
    costPerKm: number | undefined
) {
    // check that at least one field is changing to avoid a faulty query
    if (active !== undefined || managesTickets !== undefined || role !== undefined || type !== undefined ||
        registrationDate !== undefined || hoursPerDay !== undefined || costPerHour !== undefined ||
        email !== undefined || phone !== undefined || car !== undefined || costPerKm !== undefined
) {
        await knex("users")
            .where("id", id)
            .update({
                active: active,
                managesTickets: managesTickets,
                role: role,
                type: type,
                registrationDate: registrationDate,
                hoursPerDay: hoursPerDay,
                costPerHour: costPerHour,
                email: email,
                phone: phone,
                car: car,
                costPerKm: costPerKm
            })
    }
}

export async function saveUserPassword(userId: number, hashedPassword: Buffer, salt: Buffer) {
    await knex("users")
        .where({id: userId})
        .update({
            hashedPassword: hashedPassword,
            salt: salt
        })
}