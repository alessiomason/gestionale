import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from "express-validator";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {getUser} from "../users/userService";
import {Role, User} from "../users/user";
import {UserNotFound} from "../users/userErrors";
import {UserCannotReadOtherWorkedHours} from "../workItems/workItemErrors";
import {
    createOrUpdateDailyExpense,
    getAllDailyExpenses,
    getDailyExpenses,
    getPendingHolidayHours,
    notifyPendingHolidayHours,
    updateTripCosts
} from "./dailyExpenseService";
import {DailyExpense} from "./dailyExpense";
import cron from "node-cron";

export function useDailyExpensesAPIs(
    app: Express,
    isLoggedIn: RequestHandler,
    isAdministrator: RequestHandler,
    isDeveloper: RequestHandler
) {
    const baseURL = "/api/dailyExpenses";

    //get number of pending holiday hours (yet to be approved or rejected)
    app.get(`${baseURL}/pending`,
        isLoggedIn,
        isAdministrator,
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            try {
                const nPending = await getPendingHolidayHours();
                res.status(200).json(nPending);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving daily expenses"));
                }
            }
        })

    // get all daily expenses by month
    app.get(`${baseURL}/:month`,
        isLoggedIn,
        param("month").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            try {
                const dailyExpenses = await getAllDailyExpenses(req.params.month);
                res.status(200).json(dailyExpenses);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving daily expenses"));
                }
            }
        })

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

            const requestingUser = req.user as User;
            const requestedUserId = parseInt(req.params.userId);

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
        body("date").isDate(),
        body("expenses").isNumeric(),
        body("destination").isString(),
        body("kms").isNumeric(),
        body("travelHours").isNumeric(),
        body("holidayHours").isNumeric(),
        body("holidayApproved").optional({values: "null"}).isBoolean(),
        body("sickHours").isNumeric(),
        body("donationHours").isNumeric(),
        body("furloughHours").isNumeric(),
        body("bereavementHours").isNumeric(),
        body("paternityHours").isNumeric(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            const requestingUser = req.user as User;
            const requestedUserId = req.body.userId ? parseInt(req.body.userId) : requestingUser.id;

            // this is only allowed if a normal user has requested their own daily expenses
            // or if the requesting user is an administrator
            if (requestingUser.role === Role.user && requestingUser.id !== requestedUserId) {
                res.status(UserCannotReadOtherWorkedHours.code).json(new UserCannotReadOtherWorkedHours());
                return
            }

            const newDailyExpense = new DailyExpense(
                requestedUserId,
                req.body.date,
                req.body.expenses,
                req.body.destination,
                req.body.kms,
                undefined,
                req.body.travelHours,
                req.body.holidayHours,
                req.body.holidayApproved,
                req.body.sickHours,
                req.body.donationHours,
                req.body.furloughHours,
                req.body.bereavementHours,
                req.body.paternityHours
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

    // notify pending holiday hours
    app.post(`${baseURL}/pending`, isLoggedIn, isDeveloper, async (_: Request, res: Response) => {
        try {
            await notifyPendingHolidayHours();
            res.status(200).end();
        } catch (err: any) {
            if (err instanceof BaseError) {
                res.status(err.statusCode).json(err);
            } else {
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving daily expenses"));
            }
        }
    })

    // run check at 06:15 every day
    cron.schedule("15 6 * * *", notifyPendingHolidayHours, {timezone: "Europe/Rome"});

    // Updates all daily expenses that have a trip cost equal to 0 to the current trip cost for the specific user.
    // A service endpoint destined to developers alone; useful after importing data.
    app.put(baseURL, isLoggedIn, isDeveloper, async (_: Request, res: Response) => {
        try {
            await updateTripCosts();
            res.status(200).end();
        } catch (err: any) {
            console.error("Error while updating daily expenses", err.message);
            res.status(InternalServerError.code).json(new InternalServerError("Error while updating daily expenses"))
        }
    })
}