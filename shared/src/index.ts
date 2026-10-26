import { z } from "zod";
const text = z
  .string()
  .trim()
  .max(20000)
  .refine((v) => !/[<>]/.test(v), "Use plain text without HTML.");
const url = z.union([
  z.literal(""),
  z
    .string()
    .url()
    .refine((v) => /^https?:\/\//.test(v), "Use an HTTP(S) URL."),
]);
export const projectSchema = z.object({
  title: text.min(3).max(150),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: text.max(500),
  fullDescription: text.default(""),
  category: text.max(100),
  status: z.enum(["Concept", "Planned Build", "In Progress", "Completed"]),
  technologies: z.array(text.max(80)).max(30).default([]),
  components: z.array(text.max(200)).max(60).default([]),
  coverImage: url.default(""),
  gallery: z.array(url).max(30).default([]),
  videoUrl: url.default(""),
  githubUrl: url.default(""),
  documentationUrl: url.default(""),
  cadUrl: url.default(""),
  schematicsUrl: url.default(""),
  problem: text.default(""),
  approach: text.default(""),
  buildProcess: text.default(""),
  failures: text.default(""),
  lessonsLearned: text.default(""),
  outcome: text.default(""),
  futureImprovements: text.default(""),
  buildDate: text.max(50).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});
export type Project = z.infer<typeof projectSchema> & { _id?: string };
export const logSchema = z.object({
  title: text.min(3).max(150),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: text,
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  images: z.array(url).default([]),
  videoUrl: url.default(""),
  category: text.default("Experiment"),
  tags: z.array(text.max(80)).default([]),
  relatedProject: text.default(""),
  lessonsLearned: text.default(""),
  published: z.boolean().default(false),
});
export type BuildLog = z.infer<typeof logSchema> & { _id?: string };
export const profileSchema = z.object({
  name: text.max(100),
  headline: text.max(200),
  biography: text,
  location: text.max(150),
  profileImage: url,
  skills: z.object({
    Hardware: z.array(text),
    Software: z.array(text),
    "Design & Prototyping": z.array(text),
  }),
  socialLinks: z.record(
    z.string(),
    z.union([
      url,
      z
        .string()
        .regex(/^mailto:[^\s?]+@[^\s?]+$/, "Use an HTTP(S) or mailto link."),
    ]),
  ),
  resumeUrl: url,
  showreelUrl: url,
  heroContent: z.object({
    headline: text.max(150),
    description: text.max(500),
  }),
});
export type Profile = z.infer<typeof profileSchema>;
export const nextSchema = z.object({
  title: text,
  description: text,
  motivation: text,
  technicalApproach: text,
  requiredComponents: z.array(text),
  challenges: text,
  blockers: text,
  firstSteps: text,
  learningOutcomes: text,
  conceptImages: z.array(url),
  isExample: z.boolean(),
});
export const settingsSchema = z.object({
  siteTitle: text.max(150),
  metadata: z.object({ description: text.max(300) }),
  navigation: z.array(
    z.object({ label: text, path: z.string().regex(/^\/[a-z0-9/-]*$/) }),
  ),
  footer: text,
  contactInformation: text,
});
export const contactSchema = z.object({
  name: text.min(2).max(100),
  email: z.email().max(254),
  subject: text.min(3).max(200),
  message: text.min(20).max(5000),
  website: z.string().max(0, "Spam detected").optional().default(""),
});
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});
export const sampleProjects: Project[] = [
  {
    title: "Gesture-Controlled Robotic Hand",
    slug: "gesture-controlled-robotic-hand",
    shortDescription:
      "A human gesture. A mechanical response. Exploring the bridge between movement and machines.",
    category: "Robotics",
    technologies: ["Arduino", "Flex sensors", "Servo motors", "3D printing"],
    problem:
      "How could a compact robotic hand translate human finger movement into a physical response?",
    approach:
      "Start with one finger, a flex sensor, and a servo. Explore calibration before scaling to five independently controlled fingers.",
    components: [
      "Arduino Uno — proposed",
      "5 flex sensors — proposed",
      "5 micro servos — proposed",
      "Printed finger linkages — proposed",
      "External servo power supply — proposed",
    ],
    buildProcess:
      "Planned sequence: sketch the linkage → prototype one finger → wire and calibrate a sensor → add servo control → assemble → test repeatability.",
    futureImprovements:
      "Investigate grip feedback and safer force limits after the basic motion system is validated.",
  },
  {
    title: "Automatic Basketball Shooting Machine",
    slug: "basketball-shooting-machine",
    shortDescription:
      "Part mechanics, part playground. A repeatable mini basketball launcher, from first principles.",
    category: "Mechanical",
    technologies: ["DC motors", "Arduino", "Motor drivers", "CAD"],
    problem:
      "Can a small launching mechanism deliver a mini basketball toward a target consistently?",
    approach:
      "Compare a flywheel launcher with a spring-driven mechanism. Build a guarded test rig before adding a ball feeder.",
    components: [
      "DC motors — proposed",
      "Motor driver — proposed",
      "Arduino — proposed",
      "Launch wheels and frame — proposed",
      "Ball detection sensor — proposed",
    ],
    buildProcess:
      "Planned sequence: define safety constraints → compare mechanisms → build a single-shot rig → tune launch angle → measure repeatability.",
    futureImprovements:
      "Add a controlled feed mechanism after validating safe single-shot operation.",
  },
  {
    title: "Autonomous Mini Rover",
    slug: "autonomous-mini-rover",
    shortDescription:
      "Small wheels. Big curiosity. A mobile robot that learns to find its way around obstacles.",
    category: "Embedded Systems",
    technologies: [
      "Raspberry Pi",
      "Ultrasonic sensors",
      "Python",
      "Motor control",
    ],
    problem:
      "How can a small rover navigate a changing space with simple, affordable sensors?",
    approach:
      "Build differential drive control, then test obstacle detection at low speed before implementing autonomous navigation.",
    components: [
      "Raspberry Pi or Arduino — to be selected",
      "Ultrasonic range sensor — proposed",
      "Motor controller — proposed",
      "Two geared motors — proposed",
      "Chassis and battery — proposed",
    ],
    buildProcess:
      "Planned sequence: assemble chassis → test motors → measure sensor reliability → implement stop conditions → trial obstacle avoidance.",
    futureImprovements:
      "Explore mapping and sensor fusion once a reliable obstacle-avoidance baseline exists.",
  },
].map((p) => ({
  ...p,
  status: "Concept",
  fullDescription:
    "An editable demonstration concept. This is a proposed build, not a completed project.",
  coverImage: "",
  gallery: [],
  videoUrl: "",
  githubUrl: "",
  documentationUrl: "",
  cadUrl: "",
  schematicsUrl: "",
  failures:
    "No experiments have been documented yet. Failures and revisions will be recorded during the build.",
  lessonsLearned: "Learning notes will be added after real testing.",
  outcome: "No prototype or performance results have been verified.",
  buildDate: "",
  featured: true,
  published: true,
}));
export const sampleProfile: Profile = {
  name: "The Builder",
  headline: "Engineer / Maker / Experimental Builder",
  biography:
    "This is a portfolio in the making. The projects here are starting points for hands-on exploration. Add your own story, real build evidence, and the lessons you learned along the way.",
  location: "Location to be added",
  profileImage: "",
  skills: { Hardware: [], Software: [], "Design & Prototyping": [] },
  socialLinks: {},
  resumeUrl: "",
  showreelUrl: "",
  heroContent: {
    headline: "I BUILD THINGS THAT SHOULDN’T EXIST.",
    description:
      "Turning wild ideas into real-world prototypes through robotics, electronics, code, and experimentation.",
  },
};
export const sampleNext = {
  title: "A robot with a little more curiosity.",
  description:
    "An autonomous robotic system that can interact with its environment. An example concept to replace with the applicant’s own next idea.",
  motivation:
    "Explore how sensing, movement, and decision-making can work together in one physical system.",
  technicalApproach:
    "Begin with a low-speed mobile base, distance sensing, and a simple state machine. Add object interaction only after basic navigation is reliable.",
  requiredComponents: [
    "Mobile chassis",
    "Motor controller",
    "Distance sensors",
    "Microcontroller",
    "Bench power supply",
  ],
  challenges:
    "Reliable sensing, safe movement, power management, and integration between mechanical and software systems.",
  blockers:
    "The real constraints have not been added yet. Replace this example with your budget, equipment, time, or knowledge gaps.",
  firstSteps:
    "Build a bench prototype that detects one obstacle and stops reliably.",
  learningOutcomes:
    "Closed-loop control, system integration, and documenting repeatable experiments.",
  conceptImages: [],
  isExample: true,
};
export const sampleSettings = {
  siteTitle: "BUILT DIFFERENT",
  metadata: {
    description:
      "An experimental engineering portfolio. Ideas. Experiments. Things that move.",
  },
  navigation: [
    { label: "Builds", path: "/projects" },
    { label: "About", path: "/about" },
    { label: "Workshop", path: "/workshop" },
    { label: "Next build", path: "/next-build" },
  ],
  footer: "A little curiosity. A lot of making.",
  contactInformation: "",
};
