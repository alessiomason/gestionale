import mysql, {ConnectionOptions} from 'mysql2/promise';

export class Database {
    connection: mysql.Connection | null = null

    static config: ConnectionOptions = {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT as string),
        connectTimeout: 60000
    }

    async connect() {
        this.connection = await mysql.createConnection(Database.config)
    }

    disconnect() {
        this.connection?.end()
    }
}

export const db = new Database()