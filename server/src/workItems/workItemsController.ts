import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {param, validationResult} from "express-validator";
import {InternalServerError, ParameterError} from "../errors";
import {getWorkItems} from "./workItemService";

export function useWorkItemsAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/workItems";

    // get work items by user and date
    app.get(`${baseURL}/:userId/:month`,
        isLoggedIn,
        param("userId").isInt(),
        param("month").isString(),
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