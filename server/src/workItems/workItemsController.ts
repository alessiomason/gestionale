import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {param, validationResult} from "express-validator";
import {InternalServerError, ParameterError} from "../errors";
import {getWorkItems} from "./workItemService";
import {User} from "../users/user";

export function useWorkItemsAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/workItems";

    // get personal work items by date
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
            } catch (err: any) {
                console.error("Error while retrieving work items", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving work items"))
            }
        })

    // get users' work items by user and date
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
            } catch (err: any) {
                console.error("Error while retrieving work items", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving work items"))
            }
        })
}