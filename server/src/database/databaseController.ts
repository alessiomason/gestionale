import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {backupDatabase} from "./databaseService";
import cron from "node-cron";

export function useDatabaseAPIs(app: Express, isLoggedIn: RequestHandler, isDeveloper: RequestHandler) {
    const baseURL = "/api/database";

    app.post(baseURL, isLoggedIn, isDeveloper, async (_: Request, res: Response) => {
        await backupDatabase();
        res.status(200).end();
    })

    // run at 03:15 every day
    cron.schedule("15 3 * * *", backupDatabase, {timezone: "Europe/Rome"});
}