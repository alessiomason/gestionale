import app from "../src/app";
import {agent as Request} from "supertest";
import {Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import {Job} from "../src/jobs/job";
import {DuplicateJob, JobNotFound} from "../src/jobs/jobErrors";
import {clearTests, formatDate, setupTests} from "./setupTests";

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const {MockClient} = require('knex-mock-client');
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
        faker.lorem.words(3),
        faker.company.name(),
        faker.company.name(),
        faker.word.words(5),
        faker.number.float(),
        formatDate(faker.date.soon()),
        formatDate(faker.date.recent()),
        faker.lorem.sentences(),
        true,
        false,
        true,
        true
    );

    beforeAll(async () => {
        const setupResult = await setupTests();
        tracker = setupResult.tracker;
        session = setupResult.session;
    });

    afterEach(() => {
        clearTests(tracker);
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

    test("Get single job not found", async () => {
        tracker.on.select("jobs").response(undefined)

        const res = await new Request(app).get(`${baseURL}/${faker.number.int()}`).set("Cookie", session);

        const expectedError = new JobNotFound()
        expect(res.statusCode).toBe(JobNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Create job", async () => {
        tracker.on.select("jobs").response(undefined);
        tracker.on.insert("jobs").response(undefined);

        const res = await new Request(app).post(baseURL).send(job).set("Cookie", session);
        expect(res.body).toEqual(job);
    })

    test("Create duplicate job", async () => {
        tracker.on.select("jobs").response(job);

        const res = await new Request(app).post(baseURL).send(job).set("Cookie", session);

        const expectedError = new DuplicateJob()
        expect(res.statusCode).toBe(DuplicateJob.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Update job", async () => {
        tracker.on.select("jobs").response(job);
        tracker.on.update("jobs").response(undefined);

        const res = await new Request(app).put(`${baseURL}/${job.id}`).send(job).set("Cookie", session);
        expect(res.statusCode).toBe(200);
    })

    test("Update job not found", async () => {
        tracker.on.select("jobs").response(undefined);

        const res = await new Request(app).put(`${baseURL}/${job.id}`).send(job).set("Cookie", session);

        const expectedError = new JobNotFound()
        expect(res.statusCode).toBe(JobNotFound.code);
        expect(res.body).toEqual(expectedError)
    })

    test("Delete job", async () => {
        tracker.on.select("jobs").response(job);
        tracker.on.delete("jobs").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${job.id}`).set("Cookie", session);
        expect(res.statusCode).toBe(200);
    })

    test("Delete job not found", async () => {
        tracker.on.select("jobs").response(undefined);

        const res = await new Request(app).delete(`${baseURL}/${job.id}`).set("Cookie", session);

        const expectedError = new JobNotFound()
        expect(res.statusCode).toBe(JobNotFound.code);
        expect(res.body).toEqual(expectedError)
    })
})