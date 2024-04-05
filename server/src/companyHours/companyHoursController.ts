import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {param, validationResult} from "express-validator";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {getCompanyHours} from "./companyHoursService";

export function useCompanyHoursAPIs(app: Express, isLoggedIn: RequestHandler, isAdministrator: RequestHandler) {
    const baseURL = "/api/companyHours";

    // get company hours by month
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
                const companyHours = await getCompanyHours(req.params.month);
                res.status(200).json(companyHours);
            } catch (err) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    console.log(err);
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving company hours"));
                }
            }
        })
}