import {knex} from '../database/db';
import {NewUser, User} from "./user";
import {UserNotFound, UserWithSameUsernameError} from "./userErrors";
import * as crypto from "crypto";

export async function getAllUsers() {
    const users = await knex<User>("users").select();

    return users.map(user => {
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
            user.hoursPerDay,
            user.costPerHour,
            user.active,
            user.email,
            user.phone,
            user.car,
            user.costPerKm
        )
    })
}

export async function getUser(id: number) {
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
        undefined,
        undefined,
        undefined,
        user.hoursPerDay,
        user.costPerHour,
        user.active,
        user.email,
        user.phone,
        user.car,
        user.costPerKm
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
        user.hoursPerDay,
        user.costPerHour,
        user.active,
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
        undefined,
        undefined,
        undefined,
        user.hoursPerDay,
        user.costPerHour,
        user.active,
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
        undefined,
        undefined,
        user.registrationToken,
        user.hoursPerDay,
        user.costPerHour,
        user.active,
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

    const userIds = await knex("users")
        .returning("id")
        .insert(newUser);

    const registrationToken = crypto.randomBytes(8).toString("hex")

    await knex("users")
        .where({id: userIds[0]})
        .update({registrationToken: registrationToken})

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
        newUser.hoursPerDay,
        newUser.costPerHour,
        newUser.active,
        newUser.email,
        newUser.phone,
        newUser.car,
        newUser.costPerKm
    )
}

export async function saveUserPassword(userId: number, hashedPassword: Buffer, salt: Buffer) {
    await knex("users")
        .where({id: userId})
        .update({
            hashedPassword: hashedPassword,
            salt: salt
        })
}