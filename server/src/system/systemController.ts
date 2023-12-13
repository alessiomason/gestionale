import {Express, Request, Response} from "express";
import {pingDB} from "./systemService";
import {DatabaseError} from "../errors";

export function useSystemAPIs(app: Express) {
    // check if the system is online
    app.get("/ping", async (req: Request, res: Response) => {
        res.status(200).json("pong")
    })

    // check if the database is online
    app.get("/pingDB", async (req: Request, res: Response) => {
        try {
            const ping = await pingDB();
            if (ping) res.json(ping)
            else {
                res.status(DatabaseError.code).json(new DatabaseError("Failed to contact the server."))
            }
        } catch (err: any) {
            console.error(`Error while pinging DB `, err.message);
        }
    })
}