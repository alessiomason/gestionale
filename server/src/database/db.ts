import Knex from "knex";
import {knexSnakeCaseMappers} from "objection";

export const dbOptions = {
    host: process.env.DB_HOST as string,
    user: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    port: parseInt(process.env.DB_PORT as string)
}

export const knex = Knex({
    client: "mysql2",
    connection: {
        ...dbOptions,
        connectTimeout: 60000
    },
    pool: {
        min: 0,
        max: 7
    },
    ...knexSnakeCaseMappers()
});