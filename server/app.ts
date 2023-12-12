'use strict';

import express, { Express, Request, Response } from "express";
import morgan from 'morgan'; // logging middleware
import cors from 'cors';
//const userDao = require('./user-dao');
//const passport = require('passport');   // authentication middleware
//const LocalStrategy = require('passport-local').Strategy;   // username and password for login
//const session = require('express-session');    // enable sessions
import { useAPIs } from './APIs';
import dotenv from "dotenv";
dotenv.config();

// init express
const app: Express = express();
const port = process.env.PORT || 3001;

// set up the middlewares
app.use(morgan('dev'));

app.use(express.json());
const corsOptions = {
  origin: process.env.APP_URL,
  credentials: true
};
app.use(cors(corsOptions));

// expose the APIs
useAPIs(app);

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

// activate the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});