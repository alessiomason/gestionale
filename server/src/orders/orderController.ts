import {Express, Request, Response} from "express";
import {RequestHandler} from "express-serve-static-core";
import {BaseError, InternalServerError, ParameterError} from "../errors";
import {
    notifyExpiredOrders,
    clearOrder,
    createOrder,
    deleteOrder,
    getAllOrders,
    getOrder,
    unclearOrder,
    updateOrder,
    uploadedOrderFile,
    updateOrderCancelStatus
} from "./orderService";
import {body, param, validationResult} from "express-validator";
import {NewOrder} from "./order";
import dayjs from "dayjs";
import {User} from "../users/user";
import cron from "node-cron";

export function useOrdersAPIs(app: Express, isLoggedIn: RequestHandler, canManageOrders: RequestHandler) {
    const baseURL = "/api/orders";

    // get all orders
    app.get(baseURL, isLoggedIn, canManageOrders, async (_: Request, res: Response) => {
        try {
            const orders = await getAllOrders();
            res.status(200).json(orders);
        } catch (err: any) {
            if (err instanceof BaseError) {
                res.status(err.statusCode).json(err);
            } else {
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving orders"));
            }
        }
    })

    // get order by id
    app.get(`${baseURL}/:year/:id`,
        isLoggedIn,
        canManageOrders,
        param("year").isInt(),
        param("id").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the order id!"))
                return
            }

            try {
                const order = await getOrder(parseInt(req.params.id), parseInt(req.params.year));
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

    // check expired orders
    app.post(`${baseURL}/expired`, isLoggedIn, canManageOrders, async (_: Request, res: Response) => {
        try {
            await notifyExpiredOrders();
            res.status(200).end();
        } catch (err: any) {
            if (err instanceof BaseError) {
                res.status(err.statusCode).json(err);
            } else {
                res.status(InternalServerError.code).json(new InternalServerError("Error while retrieving orders"));
            }
        }
    })

    // run check at 06:15 every day
    cron.schedule("15 6 * * *", notifyExpiredOrders, {timezone: "Europe/Rome"});

    // create an order
    app.post(baseURL,
        isLoggedIn,
        canManageOrders,
        body("id").isInt(),
        body("year").isInt(),
        body("date").optional({values: "null"}).isDate(),
        body("jobId").isString(),
        body("supplier").isString(),
        body("description").isString(),
        body("scheduledDeliveryDate").optional({values: "null"}).isDate(),
        body("clearingDate").optional({values: "null"}).isDate(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the body values!"))
                return
            }

            const user = req.user as User;
            const newOrder = new NewOrder(
                parseInt(req.body.id),
                parseInt(req.body.year),
                req.body.date ?? dayjs().format("YYYY-MM-DD"),
                req.body.jobId,
                req.body.supplier,
                req.body.description,
                user.id,
                req.body.scheduledDeliveryDate,
                req.body.clearingDate ? user.id : undefined,
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
    app.put(`${baseURL}/:oldYear/:oldId`,
        isLoggedIn,
        canManageOrders,
        param("oldYear").isInt(),
        param("oldId").isInt(),
        body("year").isInt(),
        body("id").isInt(),
        body("date").optional({values: "null"}).isDate(),
        body("jobId").isString(),
        body("supplier").isString(),
        body("description").isString(),
        body("scheduledDeliveryDate").optional({values: "null"}).isDate(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors)
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const oldOrderId = parseInt(req.params.oldId);
            const oldYear = parseInt(req.params.oldYear);

            try {
                const order = await getOrder(oldOrderId, oldYear);

                const updatedOrder = new NewOrder(
                    parseInt(req.body.id),
                    parseInt(req.body.year),
                    req.body.date ?? dayjs().format("YYYY-MM-DD"),
                    req.body.jobId,
                    req.body.supplier,
                    req.body.description,
                    order.by.id,
                    req.body.scheduledDeliveryDate
                );
                await updateOrder(oldOrderId, oldYear, updatedOrder);
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

    // cancel or uncancel order
    app.patch(`${baseURL}/:year/:id/cancel`,
        isLoggedIn,
        canManageOrders,
        param("year").isInt(),
        param("id").isInt(),
        body("cancelled").isBoolean(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors)
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const orderId = parseInt(req.params.id);
            const year = parseInt(req.params.year);

            try {
                await updateOrderCancelStatus(orderId, year, req.body.cancelled)
                const order = await getOrder(orderId, year);
                res.status(200).json(order);
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating the order"));
                }
            }
        }
    )

    // clear order
    app.patch(`${baseURL}/:year/:id/clear`,
        isLoggedIn,
        canManageOrders,
        param("year").isInt(),
        param("id").isInt(),
        body("partially").optional({values: "null"}).isBoolean(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors)
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const orderId = parseInt(req.params.id);
            const year = parseInt(req.params.year);
            const user = req.user as User;

            try {
                await clearOrder(orderId, year, user.id, req.body.partially);
                const order = await getOrder(orderId, year);
                res.status(200).json(order);
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating the order"));
                }
            }
        }
    )

    // unclear order
    app.patch(`${baseURL}/:year/:id/unclear`,
        isLoggedIn,
        canManageOrders,
        param("year").isInt(),
        param("id").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors)
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const orderId = parseInt(req.params.id);
            const year = parseInt(req.params.year);

            try {
                await unclearOrder(orderId, year, req.body.partially);
                const order = await getOrder(orderId, year);
                res.status(200).json(order);
            } catch (err: any) {
                if (err instanceof BaseError) {
                    res.status(err.statusCode).json(err);
                } else {
                    res.status(InternalServerError.code).json(new InternalServerError("Error while updating the order"));
                }
            }
        }
    )

    // mark order with uploaded file flag
    app.patch(`${baseURL}/:year/:id/file`,
        isLoggedIn,
        canManageOrders,
        param("year").isInt(),
        param("id").isInt(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors)
                res.status(ParameterError.code).json(new ParameterError("There was an error with the parameters!"))
                return
            }

            const orderId = parseInt(req.params.id);
            const year = parseInt(req.params.year);

            try {
                await uploadedOrderFile(orderId, year);
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
    app.delete(`${baseURL}/:year/:id`,
        isLoggedIn,
        canManageOrders,
        param("year").isInt(),
        param("id").isString(),
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(ParameterError.code).json(new ParameterError("There was an error with the order id!"))
                return
            }

            try {
                const order = await getOrder(parseInt(req.params.id), parseInt(req.params.year));
                await deleteOrder(order.id, order.year);
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