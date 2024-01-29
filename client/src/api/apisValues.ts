const base_url = process.env.NODE_ENV === "production" ? "https://tm-gestionale-d0730417ec44.herokuapp.com" : "http://localhost";
const port = process.env.NODE_ENV === "production" ? 443 : 3001;
const apiUrl = new URL(`${base_url}:${port}/api/`);

export {base_url, port, apiUrl};