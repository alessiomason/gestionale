import app from "../src/app";
import {agent as Request} from "supertest";
import {createTracker, Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import { knex as db } from '../src/database/db';
import {Job} from "../src/jobs/job";
import {JobNotFound} from "../src/jobs/jobErrors";

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const { MockClient } = require('knex-mock-client');
    return {
        knex: Knex({client: MockClient}),
    };
});

describe("Test jobs APIs", () => {
    const baseURL = "/api/jobs"
    let tracker: Tracker;
    let session = "";

    const job = new Job(
        "24-052",
        faker.string.sample(),
        faker.company.name(),
        faker.company.name(),
        faker.string.sample(),
        faker.number.float(),
        faker.date.soon().toISOString(),
        faker.date.recent().toISOString(),
        faker.string.sample(),
        true,
        false,
        true,
        true
    )

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

    test("Get all jobs empty list", async () => {
        tracker.on.select("jobs").response([]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([]);
    })

    test("Get all jobs", async () => {
        tracker.on.select("jobs").response([job]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([job]);
    })

    test("Get single job", async () => {
        tracker.on.select("jobs").response(job);

        const res = await new Request(app).get(`${baseURL}/${job.id}`).set("Cookie", session);
        expect(res.body).toEqual(job);
    })

    test("Get single job not found", async() => {
        tracker.on.select("jobs").response(undefined)

        const res = await new Request(app).get(`${baseURL}/${faker.number.int()}`).set("Cookie", session);

        const expectedError = new JobNotFound()
        expect(res.statusCode).toBe(404)
        expect(res.body).toEqual(expectedError)
    })
})