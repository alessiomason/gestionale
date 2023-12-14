import Knex from "knex";
import {knexSnakeCaseMappers} from 'objection';

export const knex = Knex({
    client: "mysql2",
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT as string),
        connectTimeout: 60000
    },
    pool: {
        min: 0,
        max: 7,
    },
    ...knexSnakeCaseMappers()
});