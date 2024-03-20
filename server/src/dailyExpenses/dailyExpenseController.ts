import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from "express-validator";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {getUser} from "../users/userService";
import {Role, User} from "../users/user";
import {UserNotFound} from "../users/userErrors";
import {UserCannotReadOtherWorkedHours} from "../workItems/workItemErrors";
import {createOrUpdateDailyExpense, getDailyExpenses} from "./dailyExpenseService";
import {DailyExpense} from "./dailyExpense";

export function useDailyExpensesAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/dailyExpenses";

    // get users' daily expenses by user and month
    app.get(`${baseURL}/:month/:userId`,
        isLoggedIn,
        param("month").isString(),
        param("userId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const requestingUser = await getUser((req.user as User).id);
            const requestedUserId = parseInt(req.params.userId);
            if (!requestingUser) {
                res.status(UserNotFound.code).json(new UserNotFound());
                return
            }

            // this is only allowed if a normal user has requested their own daily expenses
            // or if the requesting user is an administrator
            if (requestingUser.role === Role.user && requestingUser.id !== requestedUserId) {
                res.status(UserCannotReadOtherWorkedHours.code).json(new UserCannotReadOtherWorkedHours());
                return
            }

            try {
                const dailyExpenses = await getDailyExpenses(requestedUserId, req.params.month);
                res.status(200).json(dailyExpenses);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving daily expenses"));
                }
            }
        })

    // create, update or delete daily expense
    app.post(baseURL,
        isLoggedIn,
        body("userId").optional({values: "null"}).isInt(),
        body("date").isString(),
        body("expenses").isNumeric(),
        body("destination").isString(),
        body("kms").isNumeric(),
        body("travelHours").isNumeric(),
        body("holidayHours").isNumeric(),
        body("sickHours").isNumeric(),
        body("donationHours").isNumeric(),
        body("furloughHours").isNumeric(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            const requestingUser = await getUser((req.user as User).id);
            if (!requestingUser) {
                res.status(UserNotFound.code).json(new UserNotFound());
                return
            }
            const requestedUserId = req.body.userId ? parseInt(req.body.userId) : requestingUser.id;

            // this is only allowed if a normal user has requested their own daily expenses
            // or if the requesting user is an administrator
            if (requestingUser.role === Role.user && requestingUser.id !== requestedUserId) {
                res.status(UserCannotReadOtherWorkedHours.code).json(new UserCannotReadOtherWorkedHours());
                return
            }

            const newDailyExpense = new DailyExpense(
                req.body.userId,
                req.body.date,
                req.body.expenses,
                req.body.destination,
                req.body.kms,
                undefined,
                req.body.travelHours,
                req.body.holidayHours,
                req.body.sickHours,
                req.body.donationHours,
                req.body.furloughHours
            );

            try {
                await createOrUpdateDailyExpense(newDailyExpense);
                res.status(200).end();
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating daily expenses"));
                }
            }
        })
}