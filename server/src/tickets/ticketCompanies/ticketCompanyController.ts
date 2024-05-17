import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../../errors";
import {TicketCompanyNotFound, TicketNotFound} from "../ticketErrors";
import {
    createTicketCompany,
    deleteTicketCompany,
    getAllTicketCompanies,
    getTicketCompany,
    updateTicketCompany
} from "./ticketCompanyService";
import {TicketCompanyWithProgress} from "./ticketCompany";

export function useTicketCompaniesAPIs(app: Express, isLoggedIn: RequestHandler, canManageTickets: RequestHandler) {
    const baseURL = "/api/tickets/companies"

    // get all ticket companies
    app.get(baseURL, isLoggedIn, canManageTickets, async (_: Request, res: Response) => {
        try {
            const ticketCompanies = await getAllTicketCompanies()
            const ticketCompaniesWithProgress: TicketCompanyWithProgress[] = [];

            for (let ticketCompany of ticketCompanies) {
                ticketCompaniesWithProgress.push(await ticketCompany.attachProgress())
            }

            res.status(200).json(ticketCompaniesWithProgress)
        } catch (err: any) {
            console.error("Error while retrieving ticket companies", err.message);
            res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket companies"))
        }
    })

    // get ticket company by id
    app.get(`${baseURL}/:ticketCompanyId`,
        isLoggedIn,
        canManageTickets,
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
                    res.status(200).json(await ticketCompany.attachProgress())
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
        canManageTickets,
        body("name").isString(),
        body("email").optional({values: "null"}).isString(),
        body("contact").optional({values: "null"}).isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const ticketCompany = await createTicketCompany(
                req.body.name,
                req.body.email,
                req.body.contact
            );

            const ticketCompanyWithProgress = new TicketCompanyWithProgress(
                ticketCompany.id,
                ticketCompany.name,
                ticketCompany.email,
                ticketCompany.contact,
                0,
                0
            );
            res.status(200).json(ticketCompanyWithProgress);
        }
    )

    // update a ticket company
    app.put(`${baseURL}/:ticketCompanyId`,
        isLoggedIn,
        canManageTickets,
        param("ticketCompanyId").isInt(),
        body("name").optional({values: "null"}).isString(),
        body("email").optional({values: "null"}).isString(),
        body("contact").optional({values: "null"}).isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            try {
                const ticketCompany = await getTicketCompany(parseInt(req.params.ticketCompanyId));

                if (ticketCompany) {
                    ticketCompany.name = req.body.name;
                    ticketCompany.email = req.body.email;
                    ticketCompany.contact = req.body.contact;

                    await updateTicketCompany(ticketCompany);
                    const updatedTicketCompany = await getTicketCompany(ticketCompany.id);
                    res.status(200).json(await updatedTicketCompany!.attachProgress());
                } else {
                    res.status(TicketNotFound.code).json(new TicketCompanyNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving ticket companies: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket companies"))
            }
        }
    )

    // delete ticket company
    app.delete(`${baseURL}/:ticketCompanyId`,
        isLoggedIn,
        canManageTickets,
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