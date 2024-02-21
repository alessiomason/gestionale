import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from 'express-validator';
import {InternalServerError, ParameterError} from "../../errors";
import {createTicketOrder, deleteTicketOrder, getAllTicketOrders, getTicketOrder} from "./ticketOrderService";
import {TicketOrderNotFound} from "../ticketErrors";

export function useTicketOrdersAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/tickets/orders"

    // get all ticket orders
    app.get(baseURL, isLoggedIn, async (_: Request, res: Response) => {
        try {
            const ticketOrders = await getAllTicketOrders()
            res.status(200).json(ticketOrders)
        } catch (err: any) {
            console.error("Error while retrieving ticket orders", err.message);
            res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving ticket orders"))
        }
    })

    // get ticket order by id
    app.get(`${baseURL}/:ticketOrderId`,
        isLoggedIn,
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
        body("companyId").isInt(),
        body("hours").isFloat(),
        body("date").optional({values: "null"}).isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error in the body values!"))
                return
            }

            const ticketOrder = await createTicketOrder(
                parseInt(req.body.companyId),
                parseFloat(req.body.hours),
                req.body.date
            );
            res.status(200).json(ticketOrder);
        }
    )

    // delete ticket order
    app.delete(`${baseURL}/:ticketOrderId`,
        isLoggedIn,
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