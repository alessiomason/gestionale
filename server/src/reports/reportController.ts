import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {createReport, deleteReport, getAllReports, getReport, updateReport} from "./reportService";
import {body, param, validationResult} from "express-validator";
import {NewReport} from "./report";

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

    // create a report
    app.post(baseURL,
        isLoggedIn,
        body("operatorId").isInt(),
        body("date").isDate(),
        body("jobId").isString(),
        body("address").isString(),
        body("machine").isString(),
        body("jobsDone").isString(),
        body("jobsToBeDone").isString(),
        body("reportVehicle").isString(),
        body("reportExpenses").isString(),
        body("supplyIncludesIntervention").isBoolean(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            const newReport = new NewReport(
                req.body.operatorId,
                req.body.date,
                req.body.jobId,
                req.body.address,
                req.body.machine,
                req.body.jobsDone,
                req.body.jobsToBeDone,
                req.body.reportVehicle,
                req.body.reportExpenses,
                req.body.supplyIncludesIntervention,
            )

            try {
                const report = await createReport(newReport);
                res.status(200).json(report);
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while creating the report"));
                }
            }
        }
    )

    // update a report
    app.put(`${baseURL}/:id`,
        isLoggedIn,
        param("id").isInt(),
        body("operatorId").isInt(),
        body("date").isDate(),
        body("jobId").isString(),
        body("address").isString(),
        body("machine").isString(),
        body("jobsDone").isString(),
        body("jobsToBeDone").isString(),
        body("reportVehicle").isString(),
        body("reportExpenses").isString(),
        body("supplyIncludesIntervention").isBoolean(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            const reportId = parseInt(req.params.id);
            const updatedReport = new NewReport(
                req.body.operatorId,
                req.body.date,
                req.body.jobId,
                req.body.address,
                req.body.machine,
                req.body.jobsDone,
                req.body.jobsToBeDone,
                req.body.reportVehicle,
                req.body.reportExpenses,
                req.body.supplyIncludesIntervention,
            )

            try {
                const report = await updateReport(reportId, updatedReport);
                res.status(200).json(report);
            } catch (err: any) {
                res.status(InternalServerError.code).json(new InternalServerError("Error while updating the report"));
            }
        }
    )

    // delete report
    app.delete(`${baseURL}/:id`,
        isLoggedIn,
        param("id").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the report id!"))
                return
            }

            try {
                await deleteReport(parseInt(req.params.id));
                res.status(200).end();
            } catch (err: any) {
                res.status(InternalServerError.code).json(new InternalServerError("Error while deleting the report"));
            }
        }
    )
}