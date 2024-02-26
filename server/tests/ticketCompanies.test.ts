import app from "../src/app";
import {agent as Request} from "supertest";
import {createTracker, Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import {knex as db} from '../src/database/db';
import {Ticket} from "../src/tickets/tickets/ticket";
import {TicketCompany, TicketCompanyWithProgress} from "../src/tickets/ticketCompanies/ticketCompany";
import {TicketCompanyNotFound, TicketNotFound, TicketOrderNotFound} from "../src/tickets/ticketErrors";

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const {MockClient} = require('knex-mock-client');
    return {
        knex: Knex({client: MockClient}),
    };
});

describe("Test ticket companies APIs", () => {
    const baseURL = "/api/tickets/companies"
    let tracker: Tracker;
    let session = "";

    const ticketCompany = new TicketCompany(
        faker.number.int(),
        faker.company.name(),
        faker.internet.email(),
        faker.person.fullName()
    );
    const ticketCompanyWithProgress = new TicketCompanyWithProgress(
        ticketCompany.id,
        ticketCompany.name,
        ticketCompany.email,
        ticketCompany.contact,
        0,
        0
    );

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

    test("Get all ticket companies empty list", async () => {
        tracker.on.select("ticketCompanies").response([]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([]);
    })

    test("Get all ticket companies", async () => {
        tracker.on.select("ticketCompanies").responseOnce([ticketCompany]);
        tracker.on.select("ticketOrders").responseOnce([]);
        tracker.on.select("tickets").responseOnce([]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([ticketCompanyWithProgress]);
    })

    test("Get single ticket company", async () => {
        tracker.on.select("ticketCompanies").responseOnce(ticketCompany);
        tracker.on.select("ticketOrders").responseOnce([]);
        tracker.on.select("tickets").responseOnce([]);

        const res = await new Request(app).get(`${baseURL}/${ticketCompany.id}`).set("Cookie", session);
        expect(res.body).toEqual(ticketCompanyWithProgress);
    })

    test("Get single ticket company not found", async () => {
        tracker.on.select("ticketCompanies").response(undefined)

        const res = await new Request(app).get(`${baseURL}/${faker.number.int()}`).set("Cookie", session);

        const expectedError = new TicketCompanyNotFound()
        expect(res.statusCode).toBe(TicketCompanyNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Create ticket company", async () => {
        tracker.on.insert("ticketCompanies").response([ticketCompany.id]);
        tracker.on.select("ticketCompanies").response(ticketCompany);

        const res = await new Request(app).post(baseURL).send(ticketCompany).set("Cookie", session);
        expect(res.body).toEqual(ticketCompanyWithProgress);
    })

    test("Delete ticket company", async () => {
        tracker.on.select("ticketCompanies").response(ticketCompany);
        tracker.on.delete("ticketCompanies").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${ticketCompany.id}`).set("Cookie", session);
        expect(res.statusCode).toBe(200);
    })

    test("Delete ticket company not found", async () => {
        tracker.on.select("ticketCompanies").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${ticketCompany.id}`).set("Cookie", session);

        const expectedError = new TicketCompanyNotFound()
        expect(res.statusCode).toBe(TicketCompanyNotFound.code);
        expect(res.body).toEqual(expectedError)
    })
})