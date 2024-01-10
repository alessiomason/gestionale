import {knex} from '../database/db';
import {NewUser, User} from "./user";
import {UserWithSameUsernameError} from "./userErrors";

export async function getAllUsers() {
    const users = await knex<User>("users").select();

    return users.map(user => {
        return new User(
            user.id,
            user.role,
            user.type,
            user.name,
            user.surname,
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
        user.hoursPerDay,
        user.costPerHour,
        user.active,
        user.email,
        user.phone,
        user.car,
        user.costPerKm
    )
}

export async function createUser(newUser: NewUser) {
    const existingUser = await knex
        .first()
        .where({name: newUser.name, surname: newUser.surname})

    if (existingUser) {
        throw new UserWithSameUsernameError()
    }

    const userIds = await knex("users")
        .returning("id")
        .insert(newUser);

    return new User(
        userIds[0],
        newUser.role,
        newUser.type,
        newUser.name,
        newUser.surname,
        newUser.hoursPerDay,
        newUser.costPerHour,
        newUser.active,
        newUser.email,
        newUser.phone,
        newUser.car,
        newUser.costPerKm
    )
}