import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../../errors";
import {closeTicket, createTicket, deleteTicket, getTicket, getTickets} from "./ticketService";
import {TicketAlreadyClosed, TicketCompanyNotFound, TicketNotFound} from "../ticketErrors";
import {getTicketCompany} from "../ticketCompanies/ticketCompanyService";
import dayjs from "dayjs";

export function useTicketsAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/tickets"

    // get tickets by company
    app.get(`${baseURL}/company/:ticketCompanyId`,
        isLoggedIn,
        param("ticketCompanyId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the ticket company id!"))
                return
            }

            try {
                const ticketCompany = await getTicketCompany(parseInt(req.params.ticketCompanyId));

                if (ticketCompany) {
                    const tickets = await getTickets(ticketCompany.id)
                    res.status(200).json(tickets)
                } else {
                    res.status(TicketCompanyNotFound.code).json(new TicketCompanyNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving tickets", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving tickets"))
            }
        })

    // get ticket by id
    app.get(`${baseURL}/:ticketId`,
        isLoggedIn,
        param("ticketId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the ticket id!"))
                return
            }

            try {
                const ticket = await getTicket(parseInt(req.params.ticketId));

                if (ticket) {
                    res.status(200).json(ticket)
                } else {
                    res.status(TicketNotFound.code).json(new TicketNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving tickets: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving tickets"))
            }
        }
    )

    // create a new ticket
    app.post(baseURL,
        isLoggedIn,
        body("company.id").isInt(),
        body("title").isString(),
        body("description").isString(),
        body("startTime").optional({values: "null"}).isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const ticket = await createTicket(
                parseInt(req.body.company.id),
                req.body.title,
                req.body.description,
                req.body.startTime,
                undefined
            );
            res.status(200).json(ticket);
        }
    )

    // close a ticket
    app.post(`${baseURL}/:ticketId/close`,
        isLoggedIn,
        param("ticketId").isInt(),
        body("endTime").optional({values: "null"}).isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const ticket = await getTicket(parseInt(req.params.ticketId));

            if (ticket) {
                if (!ticket.endTime) {
                    const updatedTicket = await closeTicket(ticket.id, req.body.endTime);
                    res.status(200).json(updatedTicket)
                } else {
                    res.status(TicketAlreadyClosed.code).json(new TicketAlreadyClosed())
                }
            } else {
                res.status(TicketNotFound.code).json(new TicketNotFound())
            }
        }
    )

    // delete ticket
    app.delete(`${baseURL}/:ticketId`,
        isLoggedIn,
        param("ticketId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the ticket id!"))
                return
            }

            try {
                const ticket = await getTicket(parseInt(req.params.ticketId))

                if (ticket) {
                    await deleteTicket(ticket.id)
                    res.status(200).end()
                } else {
                    res.status(TicketNotFound.code).json(new TicketNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving tickets: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving tickets"))
            }
        }
    )
}