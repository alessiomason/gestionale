import app from "../src/app";
import {agent as Request} from "supertest";
import {Tracker} from 'knex-mock-client';
import {clearTests, setupTests} from "./setupTests";

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
        const setupResult = await setupTests();
        tracker = setupResult.tracker;
        session = setupResult.session;
    });

    afterEach(() => {
        clearTests(tracker);
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
