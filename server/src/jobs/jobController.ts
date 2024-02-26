import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../errors";
import {createJob, deleteJob, getAllJobs, getJob, updateJob} from "./jobService";
import {DuplicateJob, JobNotFound} from "./jobErrors";
import {Job} from "./job";

export function useJobsAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/jobs"

    // get all jobs
    app.get(baseURL, isLoggedIn, async (_: Request, res: Response) => {
        try {
            const jobs = await getAllJobs()
            res.status(200).json(jobs)
        } catch (err: any) {
            console.error("Error while retrieving jobs", err.message);
            res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving jobs"))
        }
    })

    // get job by id
    app.get(`${baseURL}/:jobId`,
        isLoggedIn,
        param("jobId").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the job id!"))
                return
            }

            try {
                const job = await getJob(req.params.jobId)

                if (job) {
                    res.status(200).json(job)
                } else {
                    res.status(JobNotFound.code).json(new JobNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving jobs: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving jobs"))
            }
        }
    )

    // create a new job
    app.post(baseURL,
        isLoggedIn,
        body("id").isString(),
        body("subject").isString(),
        body("client").isString(),
        body("finalClient").optional({values: "null"}).isString(),
        body("orderName").optional({values: "null"}).isString(),
        body("orderAmount").optional({values: "null"}).isFloat(),
        body("dueDate").optional({values: "null"}).isString(),
        body("deliveryDate").optional({values: "null"}).isString(),
        body("notes").optional({values: "null"}).isString(),
        body("active").isBoolean(),
        body("lost").isBoolean(),
        body("design").isBoolean(),
        body("construction").isBoolean(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const newJob = new Job(
                req.body.id,
                req.body.subject,
                req.body.client,
                req.body.finalClient,
                req.body.orderName,
                req.body.orderAmount,
                req.body.dueDate,
                req.body.deliveryDate,
                req.body.notes,
                req.body.active,
                req.body.lost,
                req.body.design,
                req.body.construction
            )

            const job = await createJob(newJob);

            if (job instanceof DuplicateJob) {
                res.status(job.statusCode).json(job);
            } else {
                res.status(200).json(job);
            }
        }
    )

    // update job
    app.put(`${baseURL}/:jobId`,
        isLoggedIn,
        param("jobId").isString(),
        body("subject").optional({values: "null"}).isString(),
        body("client").optional({values: "null"}).isString(),
        body("finalClient").optional({values: "null"}).isString(),
        body("orderName").optional({values: "null"}).isString(),
        body("orderAmount").optional({values: "null"}).isFloat(),
        body("dueDate").optional({values: "null"}).isString(),
        body("deliveryDate").optional({values: "null"}).isString(),
        body("notes").optional({values: "null"}).isString(),
        body("active").optional({values: "null"}).isBoolean(),
        body("lost").optional({values: "null"}).isBoolean(),
        body("design").optional({values: "null"}).isBoolean(),
        body("construction").optional({values: "null"}).isBoolean(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const updatedJob = new Job(
                req.params.jobId,
                req.body.subject,
                req.body.client,
                req.body.finalClient,
                req.body.orderName,
                req.body.orderAmount,
                req.body.dueDate,
                req.body.deliveryDate,
                req.body.notes,
                req.body.active,
                req.body.lost,
                req.body.design,
                req.body.construction
            )

            try {
                const job = await getJob(req.params.jobId)

                if (job) {
                    await updateJob(updatedJob)
                    res.status(200).end()
                } else {
                    res.status(JobNotFound.code).json(new JobNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving jobs: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving jobs"))
            }
        }
    )

    // delete job
    app.delete(`${baseURL}/:jobId`,
        isLoggedIn,
        param("jobId").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the job id!"))
                return
            }

            try {
                const job = await getJob(req.params.jobId)

                if (job) {
                    await deleteJob(job.id)
                    res.status(200).end()
                } else {
                    res.status(JobNotFound.code).json(new JobNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving jobs: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving jobs"))
            }
        }
    )
}