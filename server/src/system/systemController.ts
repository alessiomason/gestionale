import {Express, Request, Response} from "express";
import {pingDB, closeDbConnection} from "./systemService";
import {DatabaseError} from "../errors";

export function useSystemAPIs(app: Express) {
    const baseURL = "/api/system"

    // check if the system is online
    app.get(`${baseURL}/ping`, async (_: Request, res: Response) => {
        res.status(200).json("pong")
    })

    // check if the database is online
    app.get(`${baseURL}/pingDB`, async (_: Request, res: Response) => {
        try {
            const ping = await pingDB();
            if (ping) res.json(ping)
            else {
                res.status(DatabaseError.code).json(new DatabaseError("Failed to contact the server."))
            }
        } catch (err: any) {
            console.error(`Error while pinging DB`, err.message);
        }
    })

    app.post(`${baseURL}/closeDbConnection`, async (_: Request, res: Response) => {
        closeDbConnection()
        res.status(200).json()
    })
}