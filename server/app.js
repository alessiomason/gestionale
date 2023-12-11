'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
//const userDao = require('./user-dao');
//const passport = require('passport');   // authentication middleware
//const LocalStrategy = require('passport-local').Strategy;   // username and password for login
//const session = require('express-session');    // enable sessions
//const riddlesAPIs = require('./API');

// init express
const app = new express();
const port = process.env.PORT || 3001;

// set up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}


// expose the APIs
//riddlesAPIs.useAPIs(app, isLoggedIn);

app.get("/ping", async (req, res) => {
  res.status(200).json("pong")
})

// activate the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});