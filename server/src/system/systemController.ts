import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {closeDbConnection, pingDB} from "./systemService";
import {DatabaseError} from "../errors";
import path from "path";

export function useSystemAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/system"

    // check if the system is online
    app.get(`${baseURL}/ping`, async (_: Request, res: Response) => {
        res.status(200).json("pong")
    })

    // check if the database is online
    app.get(`${baseURL}/pingDB`, isLoggedIn, async (_: Request, res: Response) => {
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

    // get the company's logo
    app.get(`${baseURL}/logo`, async (_: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, "../../../client", "src", "images", "logos", "logo.png"))
    })

    app.post(`${baseURL}/closeDbConnection`, isLoggedIn, async (_: Request, res: Response) => {
        closeDbConnection()
        res.status(200).json()
    })
}