import {Express, Request, Response} from "express";
import {InternalServerError} from "../errors";
import {getAllUsers} from "./usersService";

export function useUsersAPIs(app: Express) {
    const baseURL = "/api/users"

    // get all users
    app.get(baseURL, async (_: Request, res: Response) => {
        try {
            const users = await getAllUsers()
            res.status(200).json(users)
        } catch (err: any) {
            console.error("Error while retrieving users", err.message);
            res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving users"))
        }
    })
}