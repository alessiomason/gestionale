import app from "../src/app";
import {agent as Request} from "supertest";
import {createTracker, Tracker} from 'knex-mock-client';
import {knex as db} from '../src/database/db';

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const {MockClient} = require('knex-mock-client');
    return {
        knex: Knex({client: MockClient}),
    };
});

describe("Test system APIs", () => {
    const baseURL = "/api/system"
    let tracker: Tracker;
    let session = "";

    beforeAll(async () => {
        tracker = createTracker(db);

        const res = await new Request(app).get("/auth/mock")
        session = res.headers['set-cookie'][0]
            .split(';')
            .map(item => item.split(';')[0])
            .join(';')
    });

    afterEach(() => {
        tracker.reset();
    });

    test("Ping", async () => {
        const res = await new Request(app).get(`${baseURL}/ping`);
        expect(res.body).toEqual("pong");
    })

    test("PingDB", async () => {
        tracker.on.select('system').response({
            description: "Ping",
            value: "Pong"
        })

        const res = await new Request(app).get(`${baseURL}/pingDB`).set("Cookie", session);
        expect(res.body).toEqual("Pong");
    })
})
