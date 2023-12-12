import app from "../app";
import { agent as request } from "supertest";

describe("Test app.ts", () => {
    test("Ping", async () => {
        const res = await request(app).get("/ping");
        expect(res.body).toEqual("pong");
    });
});