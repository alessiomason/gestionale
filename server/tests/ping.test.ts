import app from "../src/app";
import { agent as request } from "supertest";

describe("Test system APIs", () => {
    const baseURL = "/api/system"

    test("Ping", async () => {
        const res = await request(app).get(`${baseURL}/ping`);
        expect(res.body).toEqual("pong");
    })

    test("PingDB", async () => {
        const res = await request(app).get(`${baseURL}/pingDB`);
        expect(res.body).toEqual("Pong");
    })

    afterAll(async () => {
        await request(app).post(`${baseURL}/closeDbConnection`)
    })
})