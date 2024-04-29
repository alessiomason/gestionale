import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {createOrder, deleteOrder, getAllOrders, getOrder, updateOrder} from "./orderService";
import {body, param, validationResult} from "express-validator";
import {NewOrder, Order} from "./order";
import dayjs from "dayjs";
import {OrderNotFound} from "./orderErrors";

export function useOrdersAPIs(app: Express, isLoggedIn: RequestHandler) {
    const baseURL = "/api/orders";

    // get all orders
    app.get(baseURL, isLoggedIn, async (_: Request, res: Response) => {
        try {
            const orders = await getAllOrders();
            res.status(200).json(orders)
        } catch (err: any) {
            if (err instanceof BaseError) {
                res.status(err.statusCode).json(err);
            } else {
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving orders"));
            }
        }
    })

    // get order by id
    app.get(`${baseURL}/:orderId`,
        isLoggedIn,
        param("orderId").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the order id!"))
                return
            }

            try {
                const order = await getOrder(parseInt(req.params.orderId));
                res.status(200).json(order);
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving orders"));
                }
            }
        }
    )

    // create an order
    app.post(baseURL,
        isLoggedIn,
        body("date").optional({values: "null"}).isDate(),
        body("jobId").isString(),
        body("supplier").isString(),
        body("description").isString(),
        body("byId").isInt(),
        body("scheduledDeliveryDate").optional({values: "null"}).isDate(),
        body("clearedById").optional({values: "null"}).isInt(),
        body("clearingDate").optional({values: "null"}).isDate(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            const newOrder = new NewOrder(
                req.body.date ?? dayjs().format("YYYY-MM-DD"),
                req.body.jobId,
                req.body.supplier,
                req.body.description,
                req.body.byId,
                req.body.scheduledDeliveryDate,
                req.body.clearedById,
                req.body.clearingDate
            );

            try {
                const order = await createOrder(newOrder);
                res.status(200).json(order);
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while creating the order"));
                }
            }
        }
    )

    // update order
    app.put(`${baseURL}/:id`,
        isLoggedIn,
        param("id").isInt(),
        body("date").optional({values: "null"}).isDate(),
        body("jobId").isString(),
        body("supplier").isString(),
        body("description").isString(),
        body("byId").isInt(),
        body("scheduledDeliveryDate").optional({values: "null"}).isDate(),
        body("clearedById").optional({values: "null"}).isInt(),
        body("clearingDate").optional({values: "null"}).isDate(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors)
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const updatedOrder = new NewOrder(
                req.body.date ?? dayjs().format("YYYY-MM-DD"),
                req.body.jobId,
                req.body.supplier,
                req.body.description,
                req.body.byId,
                req.body.scheduledDeliveryDate,
                req.body.clearedById,
                req.body.clearingDate
            );

            try {
                const order = await getOrder(parseInt(req.params.id));
                await updateOrder(order.id, updatedOrder);
                res.status(200).end();
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating the order"));
                }
            }
        }
    )

    // delete order
    app.delete(`${baseURL}/:id`,
        isLoggedIn,
        param("id").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the order id!"))
                return
            }

            try {
                const order = await getOrder(parseInt(req.params.id));
                await deleteOrder(order.id);
                res.status(200).end();
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while deleting the order"));
                }
            }
        }
    )
}