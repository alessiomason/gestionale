import {Express, Request, Response} from "express";
import {InternalServerError} from "../errors";
import {getAllUsers, getUser} from "./usersService";
import {check, validationResult} from 'express-validator';
import {UserIdError, UserNotFound} from "./userErrors"; // validation middleware

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

    // get user by id
    app.get(`${baseURL}/:userId`,
        check("userId").isInt({min: 1}),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(UserIdError.code).json(new UserIdError("The id of the user must be an integer number!"))
                return
            }

            try {
                const userId = parseInt(req.params.userId)
                const user = await getUser(userId)

                if (user) {
                    res.status(200).json(user)
                } else {
                    res.status(UserNotFound.code).json(new UserNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving users: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving users"))
            }
        })
}