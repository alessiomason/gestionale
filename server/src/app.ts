'use strict';

import express, {Express, Request, Response} from "express";
import morgan from 'morgan'; // logging middleware
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();
//const userDao = require('./user-dao');
//const passport = require('passport');   // authentication middleware
//const LocalStrategy = require('passport-local').Strategy;   // username and password for login
//const session = require('express-session');    // enable sessions
import {useSystemAPIs} from './system/systemController';
import {useUsersAPIs} from "./users/usersController";

// init express
const app: Express = express();

// set up the middlewares
app.use(morgan('dev'));

app.use(express.json());
const corsOptions = {
    origin: [process.env.APP_URL as string, process.env.DB_HOST as string],
    credentials: true
};
app.use(cors(corsOptions));

// expose the APIs
useSystemAPIs(app);
useUsersAPIs(app);

app.get("/ping", async (req: Request, res: Response) => {
    res.status(200).json("pong")
})

if (process.env.NODE_ENV === "production") {
    app.use(express.static("../client/build"));
    const path = require("path");
    app.get("*", (req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
    });
}

export default app;