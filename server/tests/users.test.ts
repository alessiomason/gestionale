import app from "../src/app";
import {agent as Request} from "supertest";
import {Tracker} from 'knex-mock-client';
import {faker} from '@faker-js/faker';
import {NewUser, User} from "../src/users/user";
import {UserNotFound, UserWithSameUsernameError} from "../src/users/userErrors";
import * as crypto from "crypto";
import {clearTests, setupTests} from "./setupTests";
import dayjs = require("dayjs");

jest.mock('../src/database/db', () => {
    const Knex = require('knex');
    const {MockClient} = require('knex-mock-client');
    return {
        knex: Knex({client: MockClient}),
    };
});

describe("Test users APIs", () => {
    const baseURL = "/api/users"
    let tracker: Tracker;
    let session = "";

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = new User(
        faker.number.int(),
        User.Role.user,
        User.Type.office,
        firstName,
        lastName,
        User.usernameFromName(firstName, lastName),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        8.0,
        30.0,
        true,
        true,
        true,
        faker.internet.email(),
        faker.phone.number(),
        faker.vehicle.model(),
        10.0
    )

    const newUser = new NewUser(
        User.Role.user,
        User.Type.office,
        firstName,
        lastName,
        User.usernameFromName(firstName, lastName),
        8.0,
        30.0
    )
    const userId = faker.number.int();

    beforeAll(async () => {
        const setupResult = await setupTests();
        tracker = setupResult.tracker;
        session = setupResult.session;
    });

    afterEach(() => {
        clearTests(tracker);
    });

    test("Get all users empty list", async () => {
        tracker.on.select("users").response([]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([]);
    })

    test("Get all users", async () => {
        tracker.on.select("users").response([user]);

        const res = await new Request(app).get(baseURL).set("Cookie", session);
        expect(res.body).toEqual([user]);
    })

    test("Get single user", async () => {
        tracker.on.select("users").response(user);

        const res = await new Request(app).get(`${baseURL}/${user.id}`).set("Cookie", session);
        expect(res.body).toEqual(user);
    })

    test("Get single user not found", async () => {
        tracker.on.select("users").response(undefined)

        const res = await new Request(app).get(`${baseURL}/${faker.number.int()}`).set("Cookie", session);

        const expectedError = new UserNotFound()
        expect(res.statusCode).toBe(UserNotFound.code)
        expect(res.body).toEqual(expectedError)
    })

    test("Get single user from registration token", async () => {
        const registrationToken = crypto.randomBytes(8).toString("hex");
        const registeredUser = user;
        registeredUser.registrationToken = registrationToken;
        registeredUser.tokenExpiryDate = dayjs().add(7, "days").format();
        tracker.on.select("users").response(registeredUser);

        const res = await new Request(app).get(`${baseURL}/registrationToken/${registrationToken}`);
        expect(res.body).toEqual(user);
    })

    test("Create user", async () => {
        tracker.on.select("users").response(undefined); // no already existing user
        tracker.on.insert("users").response([userId]);
        tracker.on.update("users").response(null);      // no answer from update call

        const res = await new Request(app).post(baseURL).send(newUser).set("Cookie", session);
        expect(res.body).toEqual({
            id: userId,
            ...newUser,
            registrationToken: res.body.registrationToken,
            // registrationToken randomly generated from the server, use the one from the response to pass the test
            tokenExpiryDate: res.body.tokenExpiryDate
        });
    })

    test("Create user with optional fields", async () => {
        const newUserWithOptionalFields = new NewUser(
            User.Role.user,
            User.Type.office,
            firstName,
            lastName,
            User.usernameFromName(firstName, lastName),
            8.0,
            30.0,
            undefined,
            undefined,
            undefined,
            faker.internet.email(),
            faker.phone.number(),
            faker.vehicle.model(),
            10.0
        )
        tracker.on.select("users").response(undefined); // no already existing user
        tracker.on.insert("users").response([userId]);
        tracker.on.update("users").response(null);      // no answer from update call

        const res = await new Request(app).post(baseURL).send(newUserWithOptionalFields).set("Cookie", session);
        expect(res.body).toEqual({
            id: userId,
            ...newUserWithOptionalFields,
            registrationToken: res.body.registrationToken,
            // registrationToken randomly generated from the server, use the one from the response to pass the test
            tokenExpiryDate: res.body.tokenExpiryDate
        });
    })

    test("Cannot create a user with the same username", async () => {
        tracker.on.select("users").response(newUser); // already existing user

        const res = await new Request(app).post(baseURL).send(newUser).set("Cookie", session);
        expect(res.body).toEqual(new UserWithSameUsernameError());
    })

    test("Update user", async () => {
        tracker.on.update("users").response(null);

        const body = {
            email: user.email,
            phone: user.phone,
            car: user.car
        }

        const res = await new Request(app).put(`${baseURL}/${user.id}`).send(body).set("Cookie", session);
        expect(res.statusCode).toBe(200);
    })
})
