import app from "../src/app";
import {agent as Request} from "supertest";
import {Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import {Ticket} from "../src/tickets/tickets/ticket";
import {TicketCompany} from "../src/tickets/ticketCompanies/ticketCompany";
import {TicketCompanyNotFound, TicketNotFound} from "../src/tickets/ticketErrors";
import {clearTests, setupTests} from "./setupTests";

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

    const ticketCompany = new TicketCompany(
        faker.number.int(),
        faker.company.name(),
        faker.internet.email(),
        faker.person.fullName()
    );
    const endedTicket = new Ticket(
        faker.number.int(),
        ticketCompany,
        faker.word.sample(),
        faker.lorem.sentences(),
        faker.date.recent().toISOString(),
        false,
        undefined,
        0,
        faker.date.soon().toISOString()
    )
    const startedTicket = new Ticket(
        endedTicket.id,
        ticketCompany,
        endedTicket.title,
        endedTicket.description,
        endedTicket.startTime
    )
    const responseEndedTicket = {
        id: endedTicket.id,
        companyId: ticketCompany.id,
        name: ticketCompany.name,
        email: ticketCompany.email,
        contact: ticketCompany.contact,
        title: endedTicket.title,
        description: endedTicket.description,
        startTime: endedTicket.startTime,
        paused: false,
        resumeTime: undefined,
        durationBeforePause: 0,
        endTime: endedTicket.endTime
    }
    const responseStartedTicket = {
        id: startedTicket.id,
        companyId: ticketCompany.id,
        name: ticketCompany.name,
        email: ticketCompany.email,
        contact: ticketCompany.contact,
        title: startedTicket.title,
        description: startedTicket.description,
        startTime: startedTicket.startTime,
        paused: false,
        resumeTime: undefined,
        durationBeforePause: 0,
        endTime: undefined
    }

    beforeAll(async () => {
        const setupResult = await setupTests();
        tracker = setupResult.tracker;
        session = setupResult.session;
    });

    afterEach(() => {
        clearTests(tracker);
    });

    test("Get tickets by company empty list", async () => {
        tracker.on.select("ticketCompanies").responseOnce(ticketCompany);
        tracker.on.select("tickets").response([]);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);
        expect(res.body).toEqual([]);
    })

    test("Get tickets by company", async () => {
        tracker.on.select("ticketCompanies").responseOnce(ticketCompany);
        tracker.on.select("tickets").response([responseEndedTicket]);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);
        expect(res.body).toEqual([endedTicket]);
    })

    test("Get tickets by company not found", async () => {
        tracker.on.select("ticketCompanies").response(undefined);

        const res = await new Request(app).get(`${baseURL}/company/${ticketCompany.id}`).set("Cookie", session);

        const expectedError = new TicketCompanyNotFound()
        expect(res.statusCode).toBe(TicketCompanyNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Get single ticket", async () => {
        tracker.on.select("tickets").response(responseEndedTicket);

        const res = await new Request(app).get(`${baseURL}/${endedTicket.id}`).set("Cookie", session);
        expect(res.body).toEqual(endedTicket);
    })

    test("Get single ticket not found", async() => {
        tracker.on.select("tickets").response(undefined)

        const res = await new Request(app).get(`${baseURL}/${faker.number.int()}`).set("Cookie", session);

        const expectedError = new TicketNotFound()
        expect(res.statusCode).toBe(TicketNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Create ticket", async () => {
        tracker.on.insert("tickets").response([endedTicket.id]);
        tracker.on.select("tickets").response(responseStartedTicket);

        const res = await new Request(app).post(baseURL).send(startedTicket).set("Cookie", session);
        const expected = {...startedTicket};
        expected.duration = res.body.duration;  // there would be a difference of some milliseconds, given that duration
                                                // is computed when the object is initialized
        expect(res.body).toEqual(expected);
    })

    test("Delete ticket", async () => {
        tracker.on.select("tickets").response(responseEndedTicket);
        tracker.on.delete("tickets").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${endedTicket.id}`).set("Cookie", session);
        expect(res.statusCode).toBe(200);
    })

    test("Delete ticket not found", async () => {
        tracker.on.select("tickets").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${endedTicket.id}`).set("Cookie", session);

        const expectedError = new TicketNotFound()
        expect(res.statusCode).toBe(TicketNotFound.code);
        expect(res.body).toEqual(expectedError)
    })
})