import app from "../src/app";
import {agent as request} from "supertest";
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

    beforeAll(() => {
        tracker = createTracker(db);
    });

    afterEach(() => {
        tracker.reset();
    });

    test("Ping", async () => {
        const res = await request(app).get(`${baseURL}/ping`);
        expect(res.body).toEqual("pong");
    })

    test("PingDB", async () => {
        const systemResponse = {
            description: "Ping",
            value: "Pong"
        }
        tracker.on.select('system').response(systemResponse)

        const res = await request(app).get(`${baseURL}/pingDB`);
        expect(res.body).toEqual("Pong");
    })
})