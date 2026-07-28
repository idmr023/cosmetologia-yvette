import request from "supertest";
import app from "../index";

describe("Health", () => {
  it("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});

describe("Auth Validation", () => {
  it("POST /api/auth/login with missing fields returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/register with invalid data returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email" });
    expect(res.status).toBe(400);
  });
});

describe("Protected Endpoints (auth middleware)", () => {
  it("GET /api/appointments without token returns 401", async () => {
    const res = await request(app).get("/api/appointments");
    expect(res.status).toBe(401);
  });

  it("GET /api/clients without token returns 401", async () => {
    const res = await request(app).get("/api/clients");
    expect(res.status).toBe(401);
  });

  it("GET /api/cash-registers without token returns 401", async () => {
    const res = await request(app).get("/api/cash-registers");
    expect(res.status).toBe(401);
  });

  it("GET /api/reports without token returns 401", async () => {
    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(401);
  });

  it("POST /api/services without auth returns 401", async () => {
    const res = await request(app)
      .post("/api/services")
      .send({ name: "Test", category: "corte", durationMin: 30, price: 50 });
    expect(res.status).toBe(401);
  });

  it("GET /api/colaboradores without token returns 401", async () => {
    const res = await request(app).get("/api/colaboradores");
    expect(res.status).toBe(401);
  });

  it("GET /api/commissions without token returns 401", async () => {
    const res = await request(app).get("/api/commissions");
    expect(res.status).toBe(401);
  });

  it("GET /api/inventory without token returns 401", async () => {
    const res = await request(app).get("/api/inventory");
    expect(res.status).toBe(401);
  });
});
