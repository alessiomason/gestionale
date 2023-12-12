import {db} from '../database/db';
import {RowDataPacket} from "mysql2/promise";

interface SystemPing extends RowDataPacket {
    value: string
}

export async function pingDB(){
    if (db.connection === null) return;

    const [rows, _] = await db.connection.query<SystemPing[]>(
        "SELECT value FROM `system` WHERE description = 'Ping'",
        null
    );

    return rows[0].value
}