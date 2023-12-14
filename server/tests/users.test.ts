import app from "../src/app";
import {agent as request} from "supertest";
import {Knex} from "knex";
import {createTracker, MockClient, Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import {User} from "../src/users/user";

jest.mock('../src/database/db', () => {
    const knex = require('knex');
    return {
        db: knex({client: MockClient}),
    };
});

describe("Test users APIs", () => {
    const baseURL = "/api/users"

    let db: Knex;
    let tracker: Tracker;

    beforeAll(() => {
        tracker = createTracker(db);
    });

    afterEach(() => {
        tracker.reset();
    });

    test("Get all users", async () => {
        const user = new User(
            faker.number.int(),
            User.Role.user,
            User.Type.office,
            true,
            faker.internet.email(),
            faker.person.firstName(),
            faker.person.lastName(),
            faker.phone.number(),
            8.0,
            30.0,
            faker.vehicle.model(),
            10.0
        )
        tracker.on.select('users').response([user]);

        const res = await request(app).get(baseURL);
        expect(res.body).toEqual([user]);
    })
})