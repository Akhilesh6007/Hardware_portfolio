import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { createApp } from "../src/app";
import { AdminUser, ProjectModel, ContactMessage } from "../src/models";
import {
  sampleProjects,
  sampleProfile,
  sampleNext,
  sampleSettings,
} from "../../shared/src";
const origin = "http://localhost:5173";
describe("read-only demo API", () => {
  const app = createApp({ demo: true });
  it("serves exactly three clearly labeled concepts", async () => {
    const r = await request(app).get("/api/v1/projects/featured");
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(3);
    expect(r.body.every((p: any) => p.status === "Concept")).toBe(true);
  });
  it("serves profile, next build, settings and empty workshop", async () => {
    for (const path of ["profile", "next-build", "settings", "build-logs"])
      expect((await request(app).get(`/api/v1/${path}`)).status).toBe(200);
  });
  it("returns 404 for unknown builds and endpoints", async () => {
    expect((await request(app).get("/api/v1/projects/missing")).status).toBe(
      404,
    );
    expect((await request(app).get("/api/v1/missing")).status).toBe(404);
  });
  it("validates contact input and refuses to fake persistence", async () => {
    expect(
      (await request(app).post("/api/v1/contact").send({ email: "invalid" }))
        .status,
    ).toBe(400);
    const r = await request(app).post("/api/v1/contact").send({
      name: "Test Builder",
      email: "test@example.com",
      subject: "A build idea",
      message: "A real message with enough detail for the form.",
    });
    expect(r.status).toBe(503);
    expect(r.body.error).toContain("not sent or saved");
  });
  it("rejects HTML input and honeypot spam", async () => {
    const body = {
      name: "Builder",
      email: "test@example.com",
      subject: "Testing",
      message: '<script>alert("test")</script>',
      website: "",
    };
    expect((await request(app).post("/api/v1/contact").send(body)).status).toBe(
      400,
    );
    expect(
      (
        await request(app)
          .post("/api/v1/contact")
          .send({
            ...body,
            message: "A valid message with enough detail.",
            website: "spam",
          })
      ).status,
    ).toBe(400);
  });
  it("rejects cross-origin login mutations", async () => {
    expect(
      (
        await request(app)
          .post("/api/v1/admin/login")
          .set("Origin", "https://untrusted.example")
          .send({ email: "x@example.com", password: "x" })
      ).status,
    ).toBe(403);
  });
  it("handles malformed JSON without leaking details", async () => {
    const r = await request(app)
      .post("/api/v1/contact")
      .set("Content-Type", "application/json")
      .send("{bad");
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("Invalid JSON body.");
  });
});
describe("MongoDB-backed authentication and CRUD", () => {
  let mongo: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;
  let agent: ReturnType<typeof request.agent>;
  let token = "";
  let id = "";
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: { launchTimeout: 60000 },
    });
    await mongoose.connect(mongo.getUri());
    await AdminUser.create({
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("test-only-password-123", 4),
    });
    app = createApp({
      demo: false,
      secret: "test-only-secret-that-is-longer-than-thirty-two-characters",
      origin,
    });
    agent = request.agent(app);
    token = (await agent.get("/api/v1/admin/csrf")).body.csrfToken;
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });
  const mutate = (method: "post" | "patch" | "delete", path: string) =>
    agent[method](`/api/v1${path}`)
      .set("Origin", origin)
      .set("X-CSRF-Token", token);
  it("protects admin endpoints", async () => {
    expect((await request(app).get("/api/v1/admin/projects")).status).toBe(401);
  });
  it("rejects invalid credentials and authenticates with an HTTP-only cookie", async () => {
    expect(
      (
        await mutate("post", "/admin/login").send({
          email: "admin@example.com",
          password: "wrong",
        })
      ).status,
    ).toBe(401);
    const r = await mutate("post", "/admin/login").send({
      email: "admin@example.com",
      password: "test-only-password-123",
    });
    expect(r.status).toBe(200);
    expect(String(r.headers["set-cookie"])).toContain("HttpOnly");
    expect(String(r.headers["set-cookie"])).toContain("SameSite=Lax");
    expect((await agent.get("/api/v1/admin/me")).body.email).toBe(
      "admin@example.com",
    );
  });
  it("blocks authenticated writes without a CSRF token", async () => {
    expect(
      (
        await agent
          .post("/api/v1/admin/projects")
          .set("Origin", origin)
          .send(sampleProjects[0])
      ).status,
    ).toBe(403);
  });
  it("creates, edits, publishes, and deletes real database records", async () => {
    const created = await mutate("post", "/admin/projects").send({
      ...sampleProjects[0],
      published: false,
    });
    expect(created.status).toBe(201);
    id = created.body._id;
    expect((await request(app).get("/api/v1/projects")).body).toHaveLength(0);
    const edited = await mutate("patch", `/admin/projects/${id}`).send({
      published: true,
      title: "Verified Test Concept",
    });
    expect(edited.status).toBe(200);
    expect(
      (await request(app).get(`/api/v1/projects/${sampleProjects[0].slug}`))
        .body.title,
    ).toBe("Verified Test Concept");
    expect(await ProjectModel.countDocuments()).toBe(1);
    expect((await mutate("delete", `/admin/projects/${id}`)).status).toBe(204);
    expect(await ProjectModel.countDocuments()).toBe(0);
  });
  it("rejects invalid IDs and sanitized input", async () => {
    expect(
      (
        await mutate("patch", "/admin/projects/not-an-id").send({
          title: "safe",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await mutate("post", "/admin/projects").send({
          ...sampleProjects[0],
          title: "<img src=x>",
        })
      ).status,
    ).toBe(400);
  });
  it("stores contact submissions and allows reading the inbox", async () => {
    const r = await request(app).post("/api/v1/contact").send({
      name: "Test Builder",
      email: "test@example.com",
      subject: "Build inquiry",
      message: "Let’s discuss a real prototype for the lab.",
    });
    expect(r.status).toBe(201);
    expect(await ContactMessage.countDocuments()).toBe(1);
    const messages = await agent.get("/api/v1/admin/messages");
    expect(messages.body).toHaveLength(1);
    expect(
      (
        await mutate("patch", `/admin/messages/${messages.body[0]._id}`).send({
          status: "read",
        })
      ).body.status,
    ).toBe("read");
  });
  it("persists profile, next-build, and settings edits", async () => {
    const profile = {
      ...sampleProfile,
      name: "Test Builder",
      socialLinks: { Email: "mailto:test@example.com" },
    };
    expect((await mutate("patch", "/admin/profile").send(profile)).status).toBe(
      200,
    );
    expect((await request(app).get("/api/v1/profile")).body.name).toBe(
      "Test Builder",
    );
    expect(
      (
        await mutate("patch", "/admin/next-build").send({
          ...sampleNext,
          title: "A test-only future concept",
        })
      ).status,
    ).toBe(200);
    expect((await request(app).get("/api/v1/next-build")).body.title).toBe(
      "A test-only future concept",
    );
    expect(
      (
        await mutate("patch", "/admin/settings").send({
          ...sampleSettings,
          footer: "A saved test footer",
        })
      ).status,
    ).toBe(200);
    expect((await request(app).get("/api/v1/settings")).body.footer).toBe(
      "A saved test footer",
    );
  });
  it("creates, publishes, updates, and deletes workshop notes", async () => {
    const note = {
      title: "An isolated test note",
      slug: "test-note",
      description: "A test-only experiment",
      date: "2026-10-25",
      published: false,
    };
    const created = await mutate("post", "/admin/build-logs").send(note);
    expect(created.status).toBe(201);
    expect((await request(app).get("/api/v1/build-logs")).body).toHaveLength(0);
    const logId = created.body._id;
    expect(
      (
        await mutate("patch", `/admin/build-logs/${logId}`).send({
          published: true,
          lessonsLearned: "One useful observation",
        })
      ).status,
    ).toBe(200);
    expect(
      (await request(app).get("/api/v1/build-logs/test-note")).body
        .lessonsLearned,
    ).toBe("One useful observation");
    expect((await mutate("post", "/admin/build-logs").send(note)).status).toBe(
      409,
    );
    expect((await mutate("delete", `/admin/build-logs/${logId}`)).status).toBe(
      204,
    );
    expect(
      (await request(app).get("/api/v1/build-logs/test-note")).status,
    ).toBe(404);
  });
  it("logs out and denies further access", async () => {
    expect((await mutate("post", "/admin/logout")).status).toBe(200);
    expect((await agent.get("/api/v1/admin/me")).status).toBe(401);
  });
});
