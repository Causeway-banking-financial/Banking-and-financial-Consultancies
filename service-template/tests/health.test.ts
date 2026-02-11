import request from "supertest";
import app from "../app/src/server";

describe("Health endpoints", () => {
  it("GET /health returns 200 with healthy status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "healthy" });
  });

  it("GET /ready returns 200 with ready status", async () => {
    const response = await request(app).get("/ready");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ready" });
  });

  it("GET / returns service info", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("service");
  });

  it("returns security headers via helmet", async () => {
    const response = await request(app).get("/health");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/nonexistent");
    expect(response.status).toBe(404);
  });
});
