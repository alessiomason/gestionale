import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../../errors";
import {TicketCompanyNotFound, TicketNotFound} from "../ticketErrors";
import {
    createTicketCompany,
    deleteTicketCompany,
    getAllTicketCompanies,
    getTicketCompany
} from "./ticketCompanyService";

export function useTicketCompaniesAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/tickets/companies"

    // get all ticket companies
    app.get(baseURL, isLoggedIn, async (_: Request, res: Response) => {
        try {
            const ticketCompanies = await getAllTicketCompanies()
            res.status(200).json(ticketCompanies)
        } catch (err: any) {
            console.error("Error while retrieving ticket companies", err.message);
            res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket companies"))
        }
    })

    // get ticket company by id
    app.get(`${baseURL}/:ticketCompanyId`,
        isLoggedIn,
        param("ticketCompanyId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the ticket company id!"))
                return
            }

            try {
                const ticketCompany = await getTicketCompany(parseInt(req.params.ticketId));

                if (ticketCompany) {
                    res.status(200).json(ticketCompany)
                } else {
                    res.status(TicketNotFound.code).json(new TicketCompanyNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving ticket companies: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket companies"))
            }
        }
    )

    // create a new ticket company
    app.post(baseURL,
        isLoggedIn,
        body("name").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const ticketCompany = await createTicketCompany(req.body.name);
            res.status(200).json(ticketCompany);
        }
    )

    // delete ticket company
    app.delete(`${baseURL}/:ticketCompanyId`,
        isLoggedIn,
        param("ticketCompanyId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the ticket company id!"))
                return
            }

            try {
                const ticketCompany = await getTicketCompany(parseInt(req.params.ticketCompanyId))

                if (ticketCompany) {
                    await deleteTicketCompany(ticketCompany.id)
                    res.status(200).end()
                } else {
                    res.status(TicketCompanyNotFound.code).json(new TicketCompanyNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving ticket companies: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket companies"))
            }
        }
    )
}