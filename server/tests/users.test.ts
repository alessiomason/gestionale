import app from "../src/app";
import {agent as request} from "supertest";
import {createTracker, Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import { knex as db } from '../src/database/db';
import {User} from "../src/users/user";
import {UserNotFound} from "../src/users/userErrors";

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const { MockClient } = require('knex-mock-client');
    return {
        knex: Knex({client: MockClient}),
    };
});

describe("Test users APIs", () => {
    const baseURL = "/api/users"
    let tracker: Tracker;

    beforeAll(() => {
        tracker = createTracker(db);
    });

    afterEach(() => {
        tracker.reset();
    });

    test("Get all users empty list", async () => {
        tracker.on.select("users").response([])

        const res = await request(app).get(baseURL)
        expect(res.body).toEqual([])
    })

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
        tracker.on.select("users").response([user]);

        const res = await request(app).get(baseURL);
        expect(res.body).toEqual([user]);
    })

    test("Get single user", async () => {
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
        tracker.on.select("users").response(user);

        const res = await request(app).get(`${baseURL}/${user.id}`);
        expect(res.body).toEqual(user);
    })

    test("Get single user not found", async() => {
        tracker.on.select("users").response(undefined)

        const res = await request(app).get(`${baseURL}/${faker.number.int()}`)

        const expectedError = new UserNotFound()
        expect(res.statusCode).toBe(404)
        expect(res.body).toEqual(expectedError)
    })
})
