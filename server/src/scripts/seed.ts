import mongoose from "mongoose";
import {
  sampleProjects,
  sampleProfile,
  sampleNext,
  sampleSettings,
} from "../../../shared/src/index.js";
import {
  ProjectModel,
  ProfileModel,
  NextBuildModel,
  SiteSettings,
} from "../models/index.js";
if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI first.");
try {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const p of sampleProjects)
    await ProjectModel.updateOne(
      { slug: p.slug },
      { $setOnInsert: p },
      { upsert: true },
    );
  for (const [model, data] of [
    [ProfileModel, sampleProfile],
    [NextBuildModel, sampleNext],
    [SiteSettings, sampleSettings],
  ] as [mongoose.Model<any>, unknown][])
    if (!(await model.exists({}))) await model.create(data);
  console.log("Concept content seeded. Existing content preserved.");
} finally {
  await mongoose.disconnect();
}
