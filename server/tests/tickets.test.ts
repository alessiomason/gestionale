import app from "../src/app";
import {agent as Request} from "supertest";
import {createTracker, Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import { knex as db } from '../src/database/db';
import {Ticket} from "../src/tickets/tickets/ticket";
import {TicketCompany} from "../src/tickets/ticketCompanies/ticketCompany";
import {TicketCompanyNotFound, TicketNotFound, TicketOrderNotFound} from "../src/tickets/ticketErrors";

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const { MockClient } = require('knex-mock-client');
    return {
        knex: Knex({client: MockClient}),
    };
});

describe("Test tickets APIs", () => {
    const baseURL = "/api/tickets"
    let tracker: Tracker;
    let session = "";

    const ticketCompany = new TicketCompany(faker.number.int(), faker.company.name());
    const ticket = new Ticket(
        faker.number.int(),
        ticketCompany,
        faker.word.sample(),
        faker.lorem.sentences(),
        faker.date.recent().toISOString(),
        faker.date.soon().toISOString()
    )
    const responseTicket = {
        id: ticket.id,
        companyId: ticketCompany.id,
        name: ticketCompany.name,
        title: ticket.title,
        description: ticket.description,
        startTime: ticket.startTime,
        endTime: ticket.endTime
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

    test("Get tickets by company empty list", async () => {
        tracker.on.select("ticketCompanies").responseOnce(ticketCompany);
        tracker.on.select("tickets").response([]);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);
        expect(res.body).toEqual([]);
    })

    test("Get tickets by company", async () => {
        tracker.on.select("ticketCompanies").responseOnce(ticketCompany);
        tracker.on.select("tickets").response([responseTicket]);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);
        expect(res.body).toEqual([ticket]);
    })

    test("Get tickets by company not found", async () => {
        tracker.on.select("ticketCompanies").response(undefined);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);

        const expectedError = new TicketCompanyNotFound()
        expect(res.statusCode).toBe(TicketCompanyNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Get single ticket", async () => {
        tracker.on.select("tickets").response(responseTicket);

        const res = await new Request(app).get(`${baseURL}/${ticket.id}`).set("Cookie", session);
        expect(res.body).toEqual(ticket);
    })

    test("Get single ticket not found", async() => {
        tracker.on.select("tickets").response(undefined)

        const res = await new Request(app).get(`${baseURL}/${faker.number.int()}`).set("Cookie", session);

        const expectedError = new TicketNotFound()
        expect(res.statusCode).toBe(TicketNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Create ticket", async () => {
        tracker.on.insert("tickets").response([ticket.id]);
        tracker.on.select("tickets").response(responseTicket);

        const res = await new Request(app).post(baseURL).send(responseTicket).set("Cookie", session);
        expect(res.body).toEqual(ticket);
    })

    test("Delete ticket", async () => {
        tracker.on.select("tickets").response(responseTicket);
        tracker.on.delete("tickets").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${ticket.id}`).set("Cookie", session);
        expect(res.statusCode).toBe(200);
    })

    test("Delete ticket not found", async () => {
        tracker.on.select("tickets").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${ticket.id}`).set("Cookie", session);

        const expectedError = new TicketNotFound()
        expect(res.statusCode).toBe(TicketNotFound.code);
        expect(res.body).toEqual(expectedError)
    })
})