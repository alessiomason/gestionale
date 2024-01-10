import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {createUser, getAllUsers, getUser} from "./userService";
import {body, param, validationResult} from 'express-validator';
import {UserNotFound, UserWithSameUsernameError} from "./userErrors";
import {NewUser, User} from "./user";

export function useUsersAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/users"

    // get all users
    app.get(baseURL, isLoggedIn, async (_: Request, res: Response) => {
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
        isLoggedIn,
        param("userId").isInt({min: 1}),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("The id of the user must be an integer number!"))
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
        }
    )

    // create a new user
    app.post(baseURL,
        isLoggedIn,
        body('role').isIn(User.allRoles.map(role => role.toString())),
        body('type').isIn(User.allTypes.map(type => type.toString())),
        body('email').optional({values: "null"}).isEmail(),
        body('name').isString(),
        body('surname').isString(),
        body('phone').optional({values: "null"}).isString(),
        body('hoursPerDay').isDecimal(),
        body('costPerHour').isDecimal(),
        body('car').optional({values: "null"}).isString(),
        body('costPerKm').optional({values: "null"}).isDecimal(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            if (req.body.role === User.Role.dev.toString()) {
                res.json(ParameterError.code).json(new ParameterError("You cannot register as a developer!"))
                return
            }

            const newUser = new NewUser(
                req.body.role,
                req.body.type,
                req.body.name,
                req.body.surname,
                req.body.hoursPerDay,
                req.body.costPerHour,
                undefined,
                req.body.email,
                req.body.phone,
                req.body.car,
                req.body.costPerKm
            )

            try {
                const user = await createUser(newUser);
                res.status(200).json(user);
            } catch (e) {
                const err = e as BaseError
                res.status(err.statusCode).json(err);
            }
        }
    )
}