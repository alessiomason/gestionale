import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from "express-validator";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {createOrUpdatePlannedDay, deletePlannedDay, getAllPlannedDays} from "./plannedDayService";
import {RawPlannedDay} from "./plannedDay";

export function usePlannedDaysAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/plannedDays";

    // get all planned days by month
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
                const plannedDays = await getAllPlannedDays(req.params.month);
                res.status(200).json(plannedDays);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving planned days"));
                }
            }
        })

    // create or update a planned day
    app.post(baseURL,
        isLoggedIn,
        body("userId").isInt(),
        body("date").isDate(),
        body("jobId").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            const rawPlannedDay = new RawPlannedDay(req.body.userId, req.body.date, req.body.jobId);

            try {
                await createOrUpdatePlannedDay(rawPlannedDay);
                res.status(200).end();
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating planned days"));
                }
            }
        })

    // delete a planned day
    app.delete(`${baseURL}/:userId/:date`,
        isLoggedIn,
        param("userId").isInt(),
        param("date").isDate(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            try {
                await deletePlannedDay(parseInt(req.params.userId), req.params.date);
                res.status(200).end();
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while deleting planned days"));
                }
            }
        }
    )
}