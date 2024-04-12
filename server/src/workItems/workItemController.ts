import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from "express-validator";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {createOrUpdateWorkItem, getAllWorkItems, getWorkItems, updateWorkItemsCosts} from "./workItemService";
import {Role, Type, User} from "../users/user";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import {UserCannotReadOtherWorkedHours} from "./workItemErrors";

export function useWorkItemsAPIs(
    app: Express,
    isLoggedIn: RequestHandler,
    isAdministrator: RequestHandler,
    isDeveloper: RequestHandler
) {
    const baseURL = "/api/workItems";

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

            const requestingUser = await getUser((req.user as User).id);
            const requestedUser = await getUser(parseInt(req.params.userId));
            if (!requestingUser || !requestedUser) {
                res.status(UserNotFound.code).json(new UserNotFound());
                return
            }

            // this is only allowed if a normal user is a workshop user having requested their own work items
            // or the work items of a machine, or if the requesting user is an administrator
            if (requestingUser.id !== requestedUser.id) {
                if (requestingUser.role === Role.user && requestingUser.type !== Type.workshop && requestedUser.type !== Type.machine) {
                    res.status(UserCannotReadOtherWorkedHours.code).json(new UserCannotReadOtherWorkedHours());
                    return
                }
            }

            try {
                const workItems = await getWorkItems(requestedUser.id, req.params.month);
                res.status(200).json(workItems);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving work items"));
                }
            }
        })

    // get company's work items by month
    app.get(`${baseURL}/:month`,
        isLoggedIn,
        isAdministrator,
        param("month").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            try {
                const monthWorkItems = await getAllWorkItems(req.params.month);
                res.status(200).json(monthWorkItems);
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
        body("userId").optional({values: "null"}).isInt(),
        body("jobId").isString(),
        body("date").isString(),
        body("hours").isNumeric(),
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
            let requestedUser: User | undefined = undefined;
            if (req.body.userId) {
                requestedUser = await getUser(req.body.userId);
                if (!requestedUser) {
                    res.status(UserNotFound.code).json(new UserNotFound());
                    return
                }

                // this operation is only allowed if a normal user is a workshop user editing the work items
                // of a machine or if the requesting user is an administrator
                if (requestingUser.id !== requestedUser.id) {
                    if (requestingUser.role === Role.user && requestingUser.type !== Type.workshop && requestedUser.type !== Type.machine) {
                        res.status(UserCannotReadOtherWorkedHours.code).json(new UserCannotReadOtherWorkedHours());
                        return
                    }
                }
            }

            try {
                await createOrUpdateWorkItem(requestedUser?.id ?? requestingUser.id, req.body.jobId, req.body.date, req.body.hours);
                res.status(200).end();
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating work items"));
                }
            }
        })

    // Updates all work items that have a cost equal to 0 to the current cost for the specific user.
    // A service endpoint destined to developers alone; useful after importing data.
    app.put(baseURL, isLoggedIn, isDeveloper, async (_: Request, res: Response) => {
        try {
            await updateWorkItemsCosts();
            res.status(200).end();
        } catch (err: any) {
            console.error("Error while updating work items", err.message);
            res.status(InternalServerError.code).json(new InternalServerError("Error while updating work items"))
        }
    })
}