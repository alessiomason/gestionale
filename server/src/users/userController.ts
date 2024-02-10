import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {
    createUser,
    getAllUsers,
    getUser,
    getPublicKeyIdFromUsername,
    getUserFromRegistrationToken,
    updateUser, saveUserPassword, getFullUser
} from "./userService";
import {body, param, validationResult} from 'express-validator';
import {UserNotFound, UserWithSameUsernameError} from "./userErrors";
import {NewUser, Role, Type, User} from "./user";
import crypto from "crypto";

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

    // get user by registrationToken
    app.get(`${baseURL}/registrationToken/:registrationToken`,
        param("registrationToken").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was ann error with the registration token!"))
                return
            }

            try {
                const user = await getUserFromRegistrationToken(req.params.registrationToken)

                if (user) {
                    user.hashedPassword = undefined;
                    user.salt = undefined;
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

    // get publicKeyId by username
    app.get(`${baseURL}/publicKeyId/:username`,
        param("username").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("The username must be a string!"))
                return
            }

            try {
                const publicKeyId = await getPublicKeyIdFromUsername(req.params.username)

                if (publicKeyId) {
                    res.status(200).json(publicKeyId)
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
                req.body.username,
                req.body.hoursPerDay,
                req.body.costPerHour,
                req.body.active,
                req.body.email,
                req.body.phone,
                req.body.car,
                req.body.costPerKm
            )

            const user = await createUser(newUser);

            if (user instanceof UserWithSameUsernameError) {
                res.status(user.statusCode).json(user);
            } else {
                res.status(200).json(user);
            }
        }
    )

    // update personal information
    app.put(baseURL,
        isLoggedIn,
        body('email').optional({values: "null"}).isEmail(),
        body('phone').optional({values: "null"}).isString(),
        body('car').optional({values: "null"}).isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const userId = (req.user as User).id;
            await updateUser(
                userId,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                req.body.email,
                req.body.phone,
                req.body.car,
                undefined
            );

            res.status(200).end();
        }
    )

    // update user
    app.put(`${baseURL}/:userId`,
        isLoggedIn,
        param("userId").isInt({min: 1}),
        body("active").optional({values: "null"}).isBoolean(),
        body("role").optional({values: "null"}).isString(),
        body("type").optional({values: "null"}).isString(),
        body("hoursPerDay").optional({values: "null"}).isFloat({min: 0, max: 8}),
        body("costPerHour").optional({values: "null"}).isFloat({min: 0}),
        body('email').optional({values: "null"}).isEmail(),
        body('phone').optional({values: "null"}).isString(),
        body('car').optional({values: "null"}).isString(),
        body("costPerKm").optional({values: "null"}).isFloat({min: 0}),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const userId = parseInt(req.params.userId);
            const roleName = req.body.role as ("user" | "admin" | "dev" | undefined);
            const typeName = req.body.type as ("office" | "workshop" | undefined);

            await updateUser(
                userId,
                req.body.active,
                roleName === undefined ? undefined : Role[roleName],
                typeName === undefined ? undefined : Type[typeName],
                parseFloat(req.body.hoursPerDay),
                parseFloat(req.body.costPerHour),
                req.body.email,
                req.body.phone,
                req.body.car,
                parseFloat(req.body.costPerKm)
            );

            res.status(200).end();
        }
    )

    // update password
    app.put(`${baseURL}/password/:userId`,
        isLoggedIn,
        param("userId").isInt({min: 1}),
        body("oldPassword").isString(),
        body("newPassword").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty() || !req.params) {
                res.status(ParameterError.code).json(new ParameterError("The registration token must be a string!"))
                return
            }

            const userId = parseInt(req.params.userId);
            const user = await getFullUser(userId);

            if (!user) {
                res.status(UserNotFound.code).json(new UserNotFound())
                return
            }

            crypto.pbkdf2(req.body.oldPassword, user.salt!, 31000, 32, "sha256", function (_err, hashedPassword) {
                if (!crypto.timingSafeEqual(user.hashedPassword!, hashedPassword)) {
                    res.status(422).json(new BaseError(422, "La vecchia password è errata!"));
                    return
                }

                const salt = crypto.randomBytes(16);
                crypto.pbkdf2(req.body.newPassword, salt, 31000, 32, "sha256", function (_err, hashedPassword) {
                    saveUserPassword(userId, hashedPassword, salt);
                    res.status(200).end()
                })
            })
        }
    )
}