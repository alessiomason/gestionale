import {knex} from '../database/db';
import {User} from "./user";

export async function getAllUsers() {
    const users = await knex<User>("users").select();

    return users.map(user => {
        return new User(
            user.id,
            user.role,
            user.type,
            user.active,
            user.email,
            user.name,
            user.surname,
            user.phone,
            user.hoursPerDay,
            user.costPerHour,
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
        user.active,
        user.email,
        user.name,
        user.surname,
        user.phone,
        user.hoursPerDay,
        user.costPerHour,
        user.car,
        user.costPerKm
    )
}