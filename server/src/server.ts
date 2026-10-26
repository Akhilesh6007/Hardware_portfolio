import mongoose from "mongoose";
import { createApp } from "./app.js";
if (process.env.MONGODB_URI)
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
const app = createApp();
const server = app.listen(Number(process.env.PORT ?? 4000), "0.0.0.0", () =>
  console.log(
    `API ready on http://localhost:${process.env.PORT ?? 4000} (${process.env.MONGODB_URI ? "MongoDB" : "read-only demo"})`,
  ),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(() => {
      void mongoose.disconnect().then(() => process.exit(0));
    }),
  );
