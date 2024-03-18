import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from "express-validator";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {createOrUpdateWorkItem, getWorkItems} from "./workItemService";
import {User} from "../users/user";

export function useWorkItemsAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/workItems";

    // get personal work items by month
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
                const userId = (req.user as User).id;
                const workItems = await getWorkItems(userId, req.params.month);
                res.status(200).json(workItems);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving work items"));
                }
            }
        })

    // get users' work items by user and month
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

            try {
                const workItems = await getWorkItems(parseInt(req.params.userId), req.params.month);
                res.status(200).json(workItems);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving work items"));
                }
            }
        })

    // create, update or delete work item
    app.post(baseURL,
        isLoggedIn,
        body("jobId").isString(),
        body("date").isString(),
        body("hours").isNumeric(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            try {
                const userId = (req.user as User).id;
                await createOrUpdateWorkItem(userId, req.body.jobId, req.body.date, req.body.hours);
                res.status(200).end();
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating work items"));
                }
            }
        })
}