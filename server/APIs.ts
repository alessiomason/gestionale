import {Express, Request, Response} from "express";

export function useAPIs(app: Express) {
    app.get("/ping", async (req: Request, res: Response) => {
        res.status(200).json("pong")
    })
}