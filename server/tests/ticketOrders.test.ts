import app from "../src/app";
import {agent as Request} from "supertest";
import {Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import {TicketCompany} from "../src/tickets/ticketCompanies/ticketCompany";
import {TicketCompanyNotFound, TicketOrderNotFound} from "../src/tickets/ticketErrors";
import {TicketOrder} from "../src/tickets/ticketOrders/ticketOrder";
import {clearTests, formatDate, setupTests} from "./setupTests";

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

    const ticketCompany = new TicketCompany(
        faker.number.int(),
        faker.company.name(),
        faker.internet.email(),
        faker.person.fullName()
    );
    const ticketOrder = new TicketOrder(
        faker.number.int(),
        ticketCompany,
        faker.number.float(),
        formatDate(faker.date.recent())
    );
    const responseTicketOrder = {
        id: ticketOrder.id,
        companyId: ticketCompany.id,
        name: ticketCompany.name,
        email: ticketCompany.email,
        contact: ticketCompany.contact,
        hours: ticketOrder.hours,
        date: ticketOrder.date
    }

    beforeAll(async () => {
        const setupResult = await setupTests();
        tracker = setupResult.tracker;
        session = setupResult.session;
    });

    afterEach(() => {
        clearTests(tracker);
    });

    test("Get ticket orders by company empty list", async () => {
        tracker.on.select("ticketCompanies").responseOnce(ticketCompany);
        tracker.on.select("ticketOrders").response([]);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);
        expect(res.body).toEqual([]);
    })

    test("Get ticket orders by company", async () => {
        tracker.on.select("ticketCompanies").responseOnce(ticketCompany);
        tracker.on.select("ticketOrders").response([responseTicketOrder]);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);
        expect(res.body).toEqual([ticketOrder]);
    })

    test("Get ticket orders by company not found", async () => {
        tracker.on.select("ticketCompanies").response(undefined);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);

        const expectedError = new TicketCompanyNotFound()
        expect(res.statusCode).toBe(TicketCompanyNotFound.code)
        expect(res.body).toEqual(expectedError)
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

        const res = await new Request(app).post(baseURL).send(ticketOrder).set("Cookie", session);
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