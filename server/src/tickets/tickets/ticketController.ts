import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../../errors";
import {closeTicket, createTicket, deleteTicket, getTicket, getTickets} from "./ticketService";
import {TicketAlreadyClosed, TicketCompanyNotFound, TicketNotFound} from "../ticketErrors";
import {getTicketCompany} from "../ticketCompanies/ticketCompanyService";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import dayjs from "dayjs";

import {google} from "googleapis";
const OAuth2 = google.auth.OAuth2;

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

                    // send report
                    if (ticket.company.email || true) {
                        // Nodemailer guide at https://nodemailer.com/smtp/oauth2/
                        // followed guide at https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1#
                        // additional step at https://github.com/nodemailer/nodemailer/issues/266#issuecomment-542791806

                        const oauth2Client = new OAuth2(
                            process.env.EMAIL_CLIENT_ID, // ClientID
                            process.env.EMAIL_CLIENT_SECRET, // Client Secret
                            "https://developers.google.com/oauthplayground" // Redirect URL
                        );
                        oauth2Client.setCredentials({
                            refresh_token: process.env.EMAIL_REFRESH_TOKEN
                        });
                        const accessToken = (await oauth2Client.getAccessToken()).token;

                        const ticketDuration = dayjs.duration(dayjs(ticket.endTime).diff(dayjs(ticket.startTime)));
                        const ticketCompany = await ticket.company.attachProgress();
                        const mailHTML = `<p>Inviamo resoconto del ticket di assistenza.</p>
                            <h3>Ticket: ${ticket.title}</h3>
                            <p>Descrizione: ${ticket.description}
                            <p>Inizio: ${dayjs(ticket.startTime).format("LL [alle] LT")}</p>
                            <p>Fine: ${dayjs(ticket.endTime).format("LL [alle] LT")}</p>
                            <p>Durata: ${ticketDuration.humanize()}</p>
                            <p>Ore di assistenza ancora disponibili: ${ticketCompany.usedHours} ore</p>`;       //// !!!

                        const smtpTransport = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 465,
                            logger: true,
                            debug: true,
                            secure: true,
                            auth: {
                                type: "OAuth2",
                                user: "ennio.mason@technomake.it",
                                clientId: process.env.EMAIL_CLIENT_ID,
                                clientSecret: process.env.EMAIL_CLIENT_SECRET,
                                refreshToken: process.env.EMAIL_REFRESH_TOKEN,
                                accessToken: accessToken ?? undefined   // if null, set undefined
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                        console.log(smtpTransport)

                        const mailOptions: Mail.Options = {
                            from: "ennio.mason@technomake.it",
                            to: "alessio.mason@me.com",
                            subject: "Report ticket di assistenza",
                            html: mailHTML
                        };

                        const info = await smtpTransport.sendMail(mailOptions);
                        console.log(info)
                    }

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