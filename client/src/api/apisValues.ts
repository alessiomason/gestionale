const base_url = process.env.NODE_ENV === "production" ? "https://tm-gestionale-d0730417ec44.herokuapp.com" : "http://localhost";
const clientPort = process.env.NODE_ENV === "production" ? 443 : 3000;
const serverPort = process.env.NODE_ENV === "production" ? 443 : 3001;
const apiUrl = new URL(`${base_url}:${serverPort}/api/`);
const publicUrl = new URL(process.env.NODE_ENV === "production" ? base_url : `${base_url}:${clientPort}`);

export {base_url, clientPort, serverPort, apiUrl, publicUrl};