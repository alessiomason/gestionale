# Gestionale

The repository contains the client and the server for a web application developed for a few companies for managing jobs, registering worked hours and, in general, to carry out the whole management of the company.  
The software has been commissioned by said companies and replaces an old application, phased out due to its limitations in maintainability and security.

## Features
- Employee
	- Register personal worked hours for every job the employee contributes to
	- Register hours worked by machines (operated by the employee) on a specific job
	- Register personal daily expenses, holiday, sick or travel hours
	- Manage assistance tickets the company provides
	- Manage incoming orders and track their progress 

- Administrator
	- Manage users: create new ones, enable and disable them
	- Create jobs and insert specific details, e.g. cost per worked hour
	- Aggregate worked hours per job and visualize costs
	- Aggregate worked hours per user per month

- Horizontal features
	- Daily backups of the database

## Technologies used
- Server
	- The server is developed in TypeScript and uses Express as a framework
	- The server relies on a MySQL database
	- The server uses Passport to manage the authentication process

- Client
	- The client is developed in TypeScript using the React library and the Bootstrap framework

## System architecture
The server exposes a set of APIs to operate and serves the client as static files, which in turn uses the APIs exposed by the server.

## Running the software
The software is usually deployed on a Heroku container, which runs the two scripts in the main `package.json`.  
To manually run the software, it would be advisable to manually run the server and, if not previously built, the client too.

### Running the client
The client can be run executing the `npm start` command in the `client` folder. The client will run on port `3000` and will contact the server on port `3001`. Otherwise, running the `npm run build` command in the same folder will build the client, which will then be served by the server as a set of static files.

### Running the server
The server can be run executing the `npm run dev` command in the `server` folder. This will run the server using _nodemon_, so the server will be restarted at every change. Alternatively, the server can be built by transpiling the TypeScript files (executing the `npm run build` command in the same folder) and then run with `npm start`.  
In any case, the server will be run on port `3001` (if not otherwise specified by the environment variable, see below).

### Testing the server
[![Tests for server](https://github.com/alessiomason/gestionale/actions/workflows/server-tests.yml/badge.svg)](https://github.com/alessiomason/gestionale/actions)  
The tests written for the server part can be run by executing the `npm run test` command in the `server` folder.

### Environment variables
#### Server environment variables
The server requires several environment variables to operate. These are usually included in a `.env` file located inside the `server` folder (file which is obviously not included in the repository for security reasons). These variables are:

- Mandatory
	- `APP_URL`: the URL the client is served from (used for CORS) - for example, it might be `http://localhost:3000` if run locally;
	- `DB_HOST`: the hostname of the database;
	- `DB_PORT`: the port of the connection to the database;
	- `DB_USERNAME`: the username for the database;
	- `DB_PASSWORD`: the password for the database;
	- `DB_NAME`: the name of the database;
	- `SESSION_SECRET`: the secret string used to sign the session ID cookie;
	- `DB_BACKUP_UPLOAD`: the URL for the PHP file to upload the database backup;
    - `REACT_APP_ORDERS_PDF_FOLDER`: the folder which contains the PHP file to upload the orders attachments;

- Optional
	- `PORT`: the port on which the server has to be served; defaults to `3001` if absent;
	- `PROJECT_PATH`: if the software is deployed on Heroku, this variable should be equal to `./server`, to define the folder which has to be deployed.

#### Client environment variables
The client too requires an environment variable, to specify the URL of the server.  
If the client is run locally, the environment variable can be omitted (as the code defaults to consider the server located at `http://localhost:3000`).  
Otherwise, the `REACT_APP_BASE_URL` environment variable is needed. If the client is served through the server, the environment variable has to be specified amongst the other variables for the server.