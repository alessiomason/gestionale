import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../../errors";
import {
    createTicketOrder,
    deleteTicketOrder,
    getTicketOrder,
    getTicketOrders
} from "./ticketOrderService";
import {TicketCompanyNotFound, TicketOrderNotFound} from "../ticketErrors";
import {getTicketCompany} from "../ticketCompanies/ticketCompanyService";
import dayjs from "dayjs";

export function useTicketOrdersAPIs(app: Express, isLoggedIn: RequestHandler, canManageTickets: RequestHandler) {
    const baseURL = "/api/tickets/orders"

    // get ticket orders by company
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
                   const ticketOrders = await getTicketOrders(ticketCompany.id)
                   res.status(200).json(ticketOrders)
               } else {
                   res.status(TicketCompanyNotFound.code).json(new TicketCompanyNotFound())
               }
            } catch (err: any) {
                console.error("Error while retrieving ticket orders", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket orders"))
            }
        })

    // get ticket order by id
    app.get(`${baseURL}/:ticketOrderId`,
        isLoggedIn,
        canManageTickets,
        param("ticketOrderId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the ticket order id!"))
                return
            }

            try {
                const ticketOrder = await getTicketOrder(parseInt(req.params.ticketOrderId));

                if (ticketOrder) {
                    res.status(200).json(ticketOrder)
                } else {
                    res.status(TicketOrderNotFound.code).json(new TicketOrderNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving ticket orders: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket orders"))
            }
        }
    )

    // create a new ticket order
    app.post(baseURL,
        isLoggedIn,
        canManageTickets,
        body("company.id").isInt(),
        body("hours").isFloat(),
        body("date").optional({values: "null"}).isDate(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const date = (req.body.date === undefined || req.body.date === "") ? dayjs().format() : req.body.date as string;

            const ticketOrder = await createTicketOrder(
                parseInt(req.body.company.id),
                parseFloat(req.body.hours),
                date
            );
            res.status(200).json(ticketOrder);
        }
    )

    // delete ticket order
    app.delete(`${baseURL}/:ticketOrderId`,
        isLoggedIn,
        canManageTickets,
        param("ticketOrderId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the ticket order id!"))
                return
            }

            try {
                const ticketOrder = await getTicketOrder(parseInt(req.params.ticketId))

                if (ticketOrder) {
                    await deleteTicketOrder(ticketOrder.id)
                    res.status(200).end()
                } else {
                    res.status(TicketOrderNotFound.code).json(new TicketOrderNotFound())
                }
            } catch (err: any) {
                console.error("Error while retrieving ticket orders: ", err.message);
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket orders"))
            }
        }
    )
}