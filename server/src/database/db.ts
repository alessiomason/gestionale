import mysql, {ConnectionOptions} from 'mysql2/promise';

export class Database {
    connection: mysql.Connection | null = null

    static config: ConnectionOptions = {
        host: "d3y0lbg7abxmbuoi.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
        user: "rnhrswm0zct3f1gg",
        password: "luqnc8p1hwkcu8fa",
        database: "z06jm4tk4on0er5a",
        connectTimeout: 60000
    }

    async connect() {
        this.connection = await mysql.createConnection(Database.config)
    }
}

export const db = new Database()