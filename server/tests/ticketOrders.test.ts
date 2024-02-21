import app from "../src/app";
import {agent as Request} from "supertest";
import {createTracker, Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import { knex as db } from '../src/database/db';
import {TicketCompany} from "../src/tickets/ticketCompanies/ticketCompany";
import {TicketNotFound, TicketOrderNotFound} from "../src/tickets/ticketErrors";
import {TicketOrder} from "../src/tickets/ticketOrders/ticketOrder";

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const { MockClient } = require('knex-mock-client');
    return {
        knex: Knex({client: MockClient}),
    };
});

describe("Test ticket orders APIs", () => {
    const baseURL = "/api/tickets/orders"
    let tracker: Tracker;
    let session = "";

    const ticketCompany = new TicketCompany(faker.number.int(), faker.company.name());
    const ticketOrder = new TicketOrder(
        faker.number.int(),
        ticketCompany,
        faker.number.float(),
        faker.date.recent().toISOString()
    )
    const responseTicketOrder = {
        id: ticketOrder.id,
        companyId: ticketCompany.id,
        name: ticketCompany.name,
        hours: ticketOrder.hours,
        date: ticketOrder.date
    }

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

    test("Get all ticket orders empty list", async () => {
        tracker.on.select("ticketOrders").response([]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([]);
    })

    test("Get all ticket orders", async () => {
        tracker.on.select("ticketOrders").response([responseTicketOrder]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([ticketOrder]);
    })

    test("Get single ticket order ", async () => {
        tracker.on.select("ticketOrders").response(responseTicketOrder);

        const res = await new Request(app).get(`${baseURL}/${ticketOrder.id}`).set("Cookie", session);
        expect(res.body).toEqual(ticketOrder);
    })

    test("Get single ticket order not found", async() => {
        tracker.on.select("ticketOrders").response(undefined)

        const res = await new Request(app).get(`${baseURL}/${faker.number.int()}`).set("Cookie", session);

        const expectedError = new TicketOrderNotFound()
        expect(res.statusCode).toBe(TicketOrderNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Create ticket order", async () => {
        tracker.on.insert("ticketOrders").response([ticketOrder.id]);
        tracker.on.select("ticketOrders").response(responseTicketOrder);

        const res = await new Request(app).post(baseURL).send(responseTicketOrder).set("Cookie", session);
        expect(res.body).toEqual(ticketOrder);
    })

    test("Delete ticket order", async () => {
        tracker.on.select("ticketOrders").response(responseTicketOrder);
        tracker.on.delete("ticketOrders").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${ticketOrder.id}`).set("Cookie", session);
        expect(res.statusCode).toBe(200);
    })

    test("Delete ticket order not found", async () => {
        tracker.on.select("ticketOrders").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${ticketOrder.id}`).set("Cookie", session);

        const expectedError = new TicketOrderNotFound()
        expect(res.statusCode).toBe(TicketOrderNotFound.code);
        expect(res.body).toEqual(expectedError)
    })
})