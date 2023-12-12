import app from "../src/app";
import { agent as request } from "supertest";

describe("Test ping API", () => {
    test("Ping", async () => {
        const res = await request(app).get("/ping");
        expect(res.body).toEqual("pong");
    });
});