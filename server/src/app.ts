'use strict';

import express, {Express, NextFunction, Request, Response} from "express";
import morgan from 'morgan';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();
import passport from 'passport';
import {SessionChallengeStore} from '@forwardemail/passport-fido2-webauthn';
import session from 'express-session';
import {useSystemAPIs} from './system/systemController';
import {useUsersAPIs} from "./users/userController";
import {setupPassport} from "./authentication/passportSetup";
import {useAuthenticationAPIs} from "./authentication/authenticationController";
import {dbOptions} from "./database/db";
import {useJobsAPIs} from "./jobs/jobController";
import {useTicketsAPIs} from "./tickets/tickets/ticketController";
import {useTicketOrdersAPIs} from "./tickets/ticketOrders/ticketOrderController";
import {useTicketCompaniesAPIs} from "./tickets/ticketCompanies/ticketCompanyController";
import {useWorkItemsAPIs} from "./workItems/workItemsController";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/it";

// setup passport
const webAuthnStore = new SessionChallengeStore();
setupPassport(webAuthnStore);

// init express
const app: Express = express();

// set up the middlewares
app.use(morgan("dev", {skip: () => process.env.NODE_ENV === "test"}));
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("it");

app.use(express.json());
const corsOptions = {
    origin: [process.env.APP_URL as string, process.env.DB_HOST as string, "https://mail.google.com/", "https://oauth2.googleapis.com"],
    credentials: true
};
app.use(cors(corsOptions));

function forceSsl(req: Request, res: Response, next: NextFunction) {
    if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(301, ["https://", req.get("Host"), req.url].join(""));
    }
    return next();
}

if (process.env.NODE_ENV === "production") {
    app.use(forceSsl);
}

// set up the session
const MySQLSessionStore = require('express-mysql-session')(session);
const sessionStore = new MySQLSessionStore(dbOptions);

app.use(session({
    secret: process.env.SESSION_SECRET ?? "A secret sentence not to share with anybody and anywhere, used to sign the session ID cookie.",
    resave: false,
    saveUninitialized: false,
    store: process.env.NODE_ENV === "test" ? undefined : sessionStore,  // use MemoryStore for testing
    rolling: true,
    cookie: {
        secure: "auto",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 15  // 15 minutes since last interaction, as rolling is set to true
    }
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));
app.use(function (req, res, next) {
    // @ts-ignore
    const messages = req.session.messages || [];
    res.locals.messages = messages;
    res.locals.hasMessages = !!messages.length;
    // @ts-ignore
    req.session.messages = [];
    next();
});

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated())
        return next();

    return res.status(401).json({error: 'This API requires an authenticated request!'});
}

// expose the APIs
useSystemAPIs(app, isLoggedIn);
useAuthenticationAPIs(app, webAuthnStore, isLoggedIn);
useUsersAPIs(app, isLoggedIn);
useJobsAPIs(app, isLoggedIn);
useTicketCompaniesAPIs(app, isLoggedIn);
useTicketOrdersAPIs(app, isLoggedIn);
useTicketsAPIs(app, isLoggedIn);
useWorkItemsAPIs(app, isLoggedIn);

if (process.env.NODE_ENV === "production") {
    const path = require("path");
    // ../../../ -> triple because the production build is served from server/dist/src/
    app.use(express.static(path.resolve(__dirname, "../../../client", "build")));
    app.get("*", (_req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, "../../../client", "build", "index.html"));
    });
}

export default app;