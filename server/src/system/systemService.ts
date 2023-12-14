import {knex} from "../database/db";
import {SystemResult} from "./systemResult";

export async function pingDB() {
    const systemResult = await knex
        .first()
        .from<SystemResult>("system")
        .where({description: "Ping"})

    return systemResult?.value
}

export function closeDbConnection() {
    void knex.destroy()
}