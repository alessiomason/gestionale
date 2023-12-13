# Gestionale

The repository contains the client and the server for a web application developed for a few companies for managing jobs and registering worked hours.  
The software has been commisioned by said companies and replaces an old application, phased out due to its limitations in maintanability and security.

## Features (to be implemented)
- Employee
	- Register personal worked hours for every job the employee contributes to
	- Register hours worked by machines on a specific job

- Administrator
	- Manage users: create new ones, enable and disable them
	- Create jobs and insert specific details, e.g. cost per worked hour
	- Register vacations, time taken off or sick leaves of employees
	- Aggregate worked hours per job ans visualize costs

## Technologies used
- Server
	- The server is developed in TypeScript and uses Express as a framework
	- The server relies on a MySQL database
	- The server uses Passport to manage the authentication process

- Client
	- The client is developed in TypeScript with the React library and using the Bootstrap framework.

## System architecture
The server exposes a set of APIs to operate and serves as static files the client, which uses the APIs exposed by the server.

## Running the software
The software is usually deployed on an Heroku container, which runs the two scripts in the main `package.json`.  
To manually run the software, it would be advisable to manually run the server and, if not previously built, the client too.

### Running the client
The client can be run executing the `npm start` in the `client` folder. The client will run on port `3000` and will contact the server on port `3001`. Otherwise, running the `npm run build` command in the same folder will build the client, which will then be served by the server as static files.

### Running the server
The server can be run executing the `npm run dev` command in the `server` folder. This will run the server using _nodemon_, so the server will be restarted at every change. Alternatevily, the server can be built by transpiling the TypeScript files (executing the `npm run build` command in the same folder) and then run with `npm start`.  
In any case, the server will be run on port `3001` (if not otherwise specified by the environment variable, see below).

### Testing the server
The tests written for the server part can be run by executing the `npm run test` command in the `server` folder.

### Environment variables
The server requires several environment variables to operate. These are usually included in a `.env` file located inside the `server` folder (file which is obviosly not included in the repository for security reasons). These variables are:

- Mandatory
	- `APP_URL`: the URL the server is served from (used for CORS);
	- `DB_HOST`: the hostname of the database;
	- `DB_PORT`: the port of the connection to the database;
	- `DB_USERNAME`: the username for the database;
	- `DB_PASSWORD`: the username for the database;
	- `DB_NAME`: the name of the database;

- Optional
	- `PORT`: specifies the port on which the server has to be served; default to `3001` if absent.


---

The README is an initial description of what the software will eventually look like. Several features are yet to be developed or implemented.