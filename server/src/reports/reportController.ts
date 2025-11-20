import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {getAllReports, getReport} from "./reportService";
import {param, validationResult} from "express-validator";

export function useReportsAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/reports";

    // get all reports
    app.get(baseURL, isLoggedIn, async (_: Request, res: Response) => {
        try {
            const reports = await getAllReports();
            res.status(200).json(reports);
        } catch (err: any) {
            if (err instanceof BaseError) {
                res.status(err.statusCode).json(err);
            } else {
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving reports"));
            }
        }
    })

    // get report by id
    app.get(`${baseURL}/:id`,
        isLoggedIn,
        param("id").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the report id!"))
                return
            }

            try {
                const report = await getReport(parseInt(req.params.id));
                res.status(200).json(report);
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving reports"));
                }
            }
        }
    )
}