import {Express, Request, Response} from "express";
import {pingDB} from "./systemService";

export function useSystemAPIs(app: Express) {
    // check if the system is online
    app.get("/ping", async (req: Request, res: Response) => {
        res.status(200).json("pong")
    })

    // check if the database is online
    app.get("/pingDB", async (req: Request, res: Response) => {
        try {
            res.json(await pingDB());
        } catch (err: any) {
            console.error(`Error while pinging DB `, err.message);
        }
    })
}