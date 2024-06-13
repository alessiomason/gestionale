import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../../errors";
import {
    closeTicket,
    createTicket,
    deleteTicket,
    editTicket,
    getTicket,
    getTickets,
    pauseResumeTicket
} from "./ticketService";
import {TicketAlreadyClosed, TicketCompanyNotFound, TicketNotFound} from "../ticketErrors";
import {getTicketCompany} from "../ticketCompanies/ticketCompanyService";
import {humanize} from "../../functions";
import dayjs from "dayjs";
import {sendEmail} from "../../email/emailService";

export function useTicketsAPIs(app: Express, isLoggedIn: RequestHandler, canManageTickets: RequestHandler) {
    const baseURL = "/api/tickets";

    // get tickets by company
    app.get(`${baseURL}/company/:ticketCompanyId`,
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
        canManageTickets,
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
        canManageTickets,
        body("company.id").isInt(),
        body("title").isString(),
        body("description").isString(),
        body("startTime").optional({values: "null"}).isISO8601(),
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

    // pause a ticket
    app.post(`${baseURL}/:ticketId/pause`,
        isLoggedIn,
        canManageTickets,
        param("ticketId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const ticket = await pauseResumeTicket(parseInt(req.params.ticketId));
            if (ticket) {
                res.status(200).json(ticket);
            } else {
                res.status(TicketNotFound.code).json(new TicketNotFound());
            }
        }
    )

    // close a ticket
    app.post(`${baseURL}/:ticketId/close`,
        isLoggedIn,
        canManageTickets,
        param("ticketId").isInt(),
        body("endTime").optional({values: "null"}).isISO8601(),
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
                    res.status(200).json(updatedTicket);

                    // send report
                    if (updatedTicket?.company.email) {
                        const ticketDuration = dayjs.duration(dayjs(updatedTicket.endTime).diff(dayjs(updatedTicket.startTime)));
                        const ticketCompany = await updatedTicket.company.attachProgress();
                        let remainingHours = ticketCompany.orderedHours - ticketCompany.usedHours;
                        remainingHours = remainingHours < 0 ? 0 : remainingHours;
                        const ticketDescription = updatedTicket.description === "" ?
                            "Nessuna descrizione fornita" : updatedTicket.description;

                        const mailHTML = `
                            <p>Inviamo resoconto del ticket di assistenza.</p>
                            <h3>Ticket: ${updatedTicket.title}</h3>
                            <p>Descrizione: ${ticketDescription}</p>
                            <p>Azienda: ${updatedTicket.company.name}</p>
                            <p>Inizio: ${dayjs(updatedTicket.startTime).format("LL [alle] LT")}</p>
                            <p>Fine: ${dayjs(updatedTicket.endTime).format("LL [alle] LT")}</p>
                            <p>Durata: ${ticketDuration.humanize()}</p>
                            <p>Ore di assistenza ancora disponibili: ${humanize(remainingHours, 2)} ore</p>
                            <p>&nbsp;&nbsp;</p>
                            <p><strong>TLF Technology s.r.l. a Socio Unico</strong></p>
                            <p>Viale Artigianato, n°4 - 12051 Alba (CN) Italia</p>
                            <p>Tel. +39 0173 060521 /// Fax +39 0173 061055 /// www.tlftechnology.it</p>
                            <p>Questa email è stata generata automaticamente.</p>`;
                        const mailText = `
                            Inviamo resoconto del ticket di assistenza.\n\n
                            Ticket: ${updatedTicket.title}\n
                            Descrizione: ${ticketDescription}\n
                            Azienda: ${updatedTicket.company.name}\n
                            Inizio: ${dayjs(updatedTicket.startTime).format("LL [alle] LT")}\n
                            Fine: ${dayjs(updatedTicket.endTime).format("LL [alle] LT")}\n
                            Durata: ${ticketDuration.humanize()}\n
                            Ore di assistenza ancora disponibili: ${humanize(remainingHours, 2)} ore`;

                        await sendEmail(updatedTicket.company.email, "Report ticket di assistenza", mailHTML, mailText);
                    }
                } else {
                    res.status(TicketAlreadyClosed.code).json(new TicketAlreadyClosed());
                }
            } else {
                res.status(TicketNotFound.code).json(new TicketNotFound());
            }
        }
    )

    // edit a ticket
    app.put(`${baseURL}/:ticketId`,
        isLoggedIn,
        canManageTickets,
        param("ticketId").isInt(),
        body("title").optional({values: "null"}).isString(),
        body("description").optional({values: "null"}).isString(),
        body("startTime").optional({values: "null"}).isISO8601(),
        body("endTime").optional({values: "null"}).isISO8601(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const ticket = await editTicket(
                parseInt(req.params.ticketId),
                req.body.title,
                req.body.description,
                req.body.startTime,
                req.body.endTime
            );

            if (ticket) {
                res.status(200).json(ticket);
            } else {
                res.status(TicketNotFound.code).json(new TicketNotFound());
            }
        }
    )

    // delete ticket
    app.delete(`${baseURL}/:ticketId`,
        isLoggedIn,
        canManageTickets,
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