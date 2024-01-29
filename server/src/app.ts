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

const store = new SessionChallengeStore();
setupPassport(store);

// init express
const app: Express = express();

// set up the middlewares
app.use(morgan('dev', {skip: () => process.env.NODE_ENV === 'test'}));

app.use(express.json());
const corsOptions = {
    origin: [process.env.APP_URL as string, process.env.DB_HOST as string],
    credentials: true
};
app.use(cors(corsOptions));

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'A secret sentence not to share with anybody and anywhere, used to sign the session ID cookie.',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: "auto",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 10
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

    return res.status(401).json({ error: 'This API requires an authenticated request!' });
}

// expose the APIs
useSystemAPIs(app, isLoggedIn);
useUsersAPIs(app, isLoggedIn);
useAuthenticationAPIs(app, store, isLoggedIn);

//if (process.env.NODE_ENV === "production") {
    import path from "path";
    // ../../.. -> triple because the production build is served from server/dist/src/
    app.use(express.static(path.resolve(__dirname, "../../../client", "build")));
    app.get("*", (_req: Request, res: Response) => {
        console.log(__dirname)
        res.sendFile(path.resolve(__dirname, "../../../client", "build", "index.html"));
    });
//}

export default app;