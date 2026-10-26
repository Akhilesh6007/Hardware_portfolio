import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { z } from "zod";
import {
  projectSchema,
  profileSchema,
  logSchema,
  nextSchema,
  settingsSchema,
  contactSchema,
  loginSchema,
  sampleProjects,
  sampleProfile,
  sampleNext,
  sampleSettings,
} from "../../shared/src/index.js";
import {
  AdminUser,
  ProjectModel,
  ProfileModel,
  BuildLogModel,
  NextBuildModel,
  ContactMessage,
  SiteSettings,
} from "./models/index.js";
type Options = {
  demo?: boolean;
  origin?: string;
  secret?: string;
  production?: boolean;
};
export function createApp(options: Options = {}) {
  const app = express();
  const demo = options.demo ?? !process.env.MONGODB_URI;
  const production =
    options.production ?? process.env.NODE_ENV === "production";
  const origins = (
    options.origin ??
    process.env.CLIENT_ORIGIN ??
    "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((s) => s.trim());
  const secret = options.secret ?? process.env.JWT_SECRET;
  if (!demo && (!secret || secret.length < 32))
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use(
    helmet(),
    cors({ origin: origins, credentials: true }),
    express.json({ limit: "1mb" }),
    cookieParser(),
  );
  const api = express.Router();
  app.use("/api/v1", api);
  const fail = (res: Response, status: number, message: string) =>
    res.status(status).json({ error: message });
  const ready = (_req: Request, res: Response, next: NextFunction) =>
    demo
      ? void fail(
          res,
          503,
          "Read-only demo. Configure MongoDB to enable saved changes.",
        )
      : next();
  const cookie = {
    httpOnly: true,
    secure: production,
    sameSite: "lax" as const,
    path: "/api/v1/admin",
    maxAge: 8 * 60 * 60 * 1000,
  };
  const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = jwt.verify(req.cookies.session, secret!, {
        algorithms: ["HS256"],
        issuer: "builder-portfolio",
        audience: "admin",
      }) as jwt.JwtPayload;
      if (payload.role !== "admin" || !payload.sub) throw new Error();
      res.locals.adminId = payload.sub;
      next();
    } catch {
      fail(res, 401, "Sign in to continue.");
    }
  };
  const csrf = (req: Request, res: Response, next: NextFunction) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (
        !origins.includes(req.get("origin") ?? "") ||
        !req.get("x-csrf-token") ||
        req.get("x-csrf-token") !== req.cookies.csrf
      ) {
        fail(res, 403, "Invalid request origin or CSRF token.");
        return;
      }
    }
    next();
  };
  api.get("/health", (_req, res) =>
    res.json({
      mode: demo ? "demo" : "database",
      database: mongoose.connection.readyState === 1,
    }),
  );
  api.get("/profile", async (_req, res) =>
    res.json(
      demo
        ? sampleProfile
        : ((await ProfileModel.findOne().lean()) ?? sampleProfile),
    ),
  );
  api.get("/settings", async (_req, res) =>
    res.json(
      demo
        ? sampleSettings
        : ((await SiteSettings.findOne().lean()) ?? sampleSettings),
    ),
  );
  api.get("/next-build", async (_req, res) =>
    res.json(
      demo
        ? sampleNext
        : ((await NextBuildModel.findOne().lean()) ?? sampleNext),
    ),
  );
  api.get("/projects", async (_req, res) =>
    res.json(
      demo
        ? sampleProjects
        : await ProjectModel.find({ published: true })
            .sort({ createdAt: -1 })
            .lean(),
    ),
  );
  api.get("/projects/featured", async (_req, res) =>
    res.json(
      demo
        ? sampleProjects
        : await ProjectModel.find({ published: true, featured: true })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean(),
    ),
  );
  api.get("/projects/:slug", async (req, res) => {
    const p = demo
      ? sampleProjects.find((p) => p.slug === req.params.slug)
      : await ProjectModel.findOne({
          slug: req.params.slug,
          published: true,
        }).lean();
    if (!p) {
      fail(res, 404, "Build not found.");
      return;
    }
    res.json(p);
  });
  api.get("/build-logs", async (_req, res) =>
    res.json(
      demo
        ? []
        : await BuildLogModel.find({ published: true })
            .sort({ date: -1 })
            .lean(),
    ),
  );
  api.get("/build-logs/:slug", async (req, res) => {
    const p = demo
      ? null
      : await BuildLogModel.findOne({
          slug: req.params.slug,
          published: true,
        }).lean();
    if (!p) {
      fail(res, 404, "Workshop entry not found.");
      return;
    }
    res.json(p);
  });
  api.post(
    "/contact",
    rateLimit({
      windowMs: 15 * 60000,
      limit: 5,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    async (req, res) => {
      const data = contactSchema.parse(req.body);
      if (demo) {
        fail(
          res,
          503,
          "This preview is read-only. Your message was not sent or saved.",
        );
        return;
      }
      await ContactMessage.create(data);
      let notification = "not-configured";
      if (process.env.SMTP_HOST && process.env.CONTACT_NOTIFY_EMAIL) {
        try {
          const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: process.env.SMTP_PORT === "465",
            auth: process.env.SMTP_USER
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
              : undefined,
            connectionTimeout: 5000,
          });
          await transport.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.CONTACT_NOTIFY_EMAIL,
            replyTo: data.email,
            subject: `Portfolio: ${data.subject}`,
            text: `${data.name} (${data.email})\n\n${data.message}`,
          });
          notification = "sent";
        } catch {
          notification = "failed";
        }
      }
      res
        .status(201)
        .json({
          message: "Your message has been saved. Thank you for reaching out.",
          notification,
        });
    },
  );
  api.get("/admin/csrf", (_req, res) => {
    const token = randomBytes(32).toString("hex");
    res.cookie("csrf", token, { ...cookie, httpOnly: true });
    res.json({ csrfToken: token });
  });
  api.post(
    "/admin/login",
    rateLimit({
      windowMs: 15 * 60000,
      limit: 8,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    csrf,
    ready,
    async (req, res) => {
      const data = loginSchema.parse(req.body);
      const user = await AdminUser.findOne({
        email: data.email.toLowerCase(),
      }).select("+passwordHash");
      if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
        fail(res, 401, "Invalid email or password.");
        return;
      }
      const token = jwt.sign({ role: "admin" }, secret!, {
        subject: user.id,
        algorithm: "HS256",
        expiresIn: "8h",
        issuer: "builder-portfolio",
        audience: "admin",
      });
      res.cookie("session", token, cookie);
      res.json({ email: user.email });
    },
  );
  api.use("/admin", ready, auth, csrf);
  api.get("/admin/me", async (_req, res) => {
    const user = await AdminUser.findById(res.locals.adminId).lean();
    if (!user) {
      fail(res, 401, "Account unavailable.");
      return;
    }
    res.json({ email: user.email });
  });
  api.post("/admin/logout", (_req, res) => {
    res.clearCookie("session", cookie);
    res.clearCookie("csrf", cookie);
    res.json({ message: "Signed out." });
  });
  api.get("/admin/messages", async (_req, res) =>
    res.json(
      await ContactMessage.find().sort({ createdAt: -1 }).limit(500).lean(),
    ),
  );
  api.patch("/admin/messages/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      fail(res, 400, "Invalid message ID.");
      return;
    }
    const { status } = z
      .object({ status: z.enum(["read", "archived", "unread"]) })
      .parse(req.body);
    const doc = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!doc) {
      fail(res, 404, "Message not found.");
      return;
    }
    res.json(doc);
  });
  for (const [path, model, schema] of [
    ["projects", ProjectModel, projectSchema],
    ["build-logs", BuildLogModel, logSchema],
  ] as [
    string,
    mongoose.Model<any>,
    typeof projectSchema | typeof logSchema,
  ][]) {
    api.get(`/admin/${path}`, async (_req, res) =>
      res.json(await model.find().sort({ createdAt: -1 }).lean()),
    );
    api.post(`/admin/${path}`, async (req, res) => {
      const data = schema.parse(req.body);
      res.status(201).json(await model.create(data));
    });
    api.patch(`/admin/${path}/:id`, async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) {
        fail(res, 400, "Invalid record ID.");
        return;
      }
      const data = schema.partial().parse(req.body);
      const doc = await model.findByIdAndUpdate(
        req.params.id,
        { $set: data },
        { new: true, runValidators: true },
      );
      if (!doc) {
        fail(res, 404, "Record not found.");
        return;
      }
      res.json(doc);
    });
    api.delete(`/admin/${path}/:id`, async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) {
        fail(res, 400, "Invalid record ID.");
        return;
      }
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) {
        fail(res, 404, "Record not found.");
        return;
      }
      res.status(204).end();
    });
  }
  for (const [path, model, schema] of [
    ["profile", ProfileModel, profileSchema],
    ["next-build", NextBuildModel, nextSchema],
    ["settings", SiteSettings, settingsSchema],
  ] as [string, mongoose.Model<any>, z.ZodType][]) {
    api.patch(`/admin/${path}`, async (req, res) => {
      const data = schema.parse(req.body) as Record<string, unknown>;
      res.json(
        await model.findOneAndUpdate(
          {},
          { $set: data },
          { upsert: true, new: true, runValidators: true },
        ),
      );
    });
  }
  api.post("/admin/media/sign", (_req, res) => {
    const {
      CLOUDINARY_API_KEY: key,
      CLOUDINARY_API_SECRET: secret,
      CLOUDINARY_CLOUD_NAME: cloud,
    } = process.env;
    if (!key || !secret || !cloud) {
      fail(
        res,
        503,
        "Image upload is not configured. Attach an HTTPS image URL instead.",
      );
      return;
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "builder-portfolio";
    const signature = createHash("sha256")
      .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
      .digest("hex");
    res.json({
      timestamp,
      folder,
      signature,
      api_key: key,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    });
  });
  api.use((_req, res) => fail(res, 404, "API endpoint not found."));
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Please check your input.", details: err.flatten() });
      return;
    }
    if (typeof err === "object" && err && "code" in err && err.code === 11000) {
      fail(res, 409, "This slug or email is already in use.");
      return;
    }
    if (err instanceof SyntaxError) {
      fail(res, 400, "Invalid JSON body.");
      return;
    }
    console.error(
      "Request failed:",
      err instanceof Error ? err.message : "Unknown error",
    );
    fail(res, 500, "Something went wrong. Please try again.");
  });
  return app;
}
