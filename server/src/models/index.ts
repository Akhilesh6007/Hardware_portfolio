import mongoose, { Schema } from "mongoose";
const str = { type: String, default: "" };
const base = { timestamps: true, strict: true };
export const AdminUser = mongoose.model(
  "AdminUser",
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true },
      passwordHash: { type: String, required: true, select: false },
      role: { type: String, enum: ["admin"], default: "admin" },
    },
    base,
  ),
);
export const ProjectModel = mongoose.model(
  "Project",
  new Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      shortDescription: str,
      fullDescription: str,
      category: str,
      status: {
        type: String,
        enum: ["Concept", "Planned Build", "In Progress", "Completed"],
        default: "Concept",
      },
      technologies: [String],
      components: [String],
      coverImage: str,
      gallery: [String],
      videoUrl: str,
      githubUrl: str,
      documentationUrl: str,
      cadUrl: str,
      schematicsUrl: str,
      problem: str,
      approach: str,
      buildProcess: str,
      failures: str,
      lessonsLearned: str,
      outcome: str,
      futureImprovements: str,
      buildDate: str,
      featured: { type: Boolean, default: false },
      published: { type: Boolean, default: false },
    },
    base,
  ).index({ published: 1, featured: 1 }),
);
export const ProfileModel = mongoose.model(
  "Profile",
  new Schema(
    {
      name: str,
      headline: str,
      biography: str,
      location: str,
      profileImage: str,
      skills: {
        Hardware: [String],
        Software: [String],
        "Design & Prototyping": [String],
      },
      socialLinks: { type: Map, of: String },
      resumeUrl: str,
      showreelUrl: str,
      heroContent: { headline: str, description: str },
    },
    base,
  ),
);
export const BuildLogModel = mongoose.model(
  "BuildLog",
  new Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: str,
      date: { type: Date, required: true },
      images: [String],
      videoUrl: str,
      category: str,
      tags: [String],
      relatedProject: str,
      lessonsLearned: str,
      published: { type: Boolean, default: false },
    },
    base,
  ).index({ published: 1, date: -1 }),
);
export const NextBuildModel = mongoose.model(
  "NextBuild",
  new Schema(
    {
      title: str,
      description: str,
      motivation: str,
      technicalApproach: str,
      requiredComponents: [String],
      challenges: str,
      blockers: str,
      firstSteps: str,
      learningOutcomes: str,
      conceptImages: [String],
      isExample: { type: Boolean, default: true },
    },
    base,
  ),
);
export const ContactMessage = mongoose.model(
  "ContactMessage",
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      subject: { type: String, required: true },
      message: { type: String, required: true },
      status: {
        type: String,
        enum: ["unread", "read", "archived"],
        default: "unread",
      },
    },
    base,
  ).index({ createdAt: -1 }),
);
export const SiteSettings = mongoose.model(
  "SiteSettings",
  new Schema(
    {
      siteTitle: str,
      metadata: { description: str },
      navigation: [{ label: String, path: String, _id: false }],
      footer: str,
      contactInformation: str,
    },
    base,
  ),
);
