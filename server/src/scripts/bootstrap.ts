import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { z } from "zod";
import { AdminUser } from "../models/index.js";
const config = z
  .object({
    MONGODB_URI: z.string().min(1),
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(12).max(128),
  })
  .parse(process.env);
try {
  await mongoose.connect(config.MONGODB_URI);
  if (await AdminUser.exists({ email: config.ADMIN_EMAIL.toLowerCase() }))
    throw new Error("Admin already exists; no password was changed.");
  await AdminUser.create({
    email: config.ADMIN_EMAIL.toLowerCase(),
    passwordHash: await bcrypt.hash(config.ADMIN_PASSWORD, 12),
  });
  console.log(
    "Admin created. Remove ADMIN_PASSWORD from your environment after bootstrap.",
  );
} finally {
  await mongoose.disconnect();
}
