import {createTracker, Tracker} from "knex-mock-client";
import {knex as db} from "../src/database/db";
import {agent as Request} from "supertest";
import app from "../src/app";

export async function setupTests() {
    const tracker = createTracker(db);

    const res = await new Request(app).get("/auth/mock")
    const session = res.headers['set-cookie'][0]
        .split(';')
        .map(item => item.split(';')[0])
        .join(';')

    return {tracker, session};
}

export function clearTests(tracker: Tracker) {
    tracker.reset();
}

export function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}