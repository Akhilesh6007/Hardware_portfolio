import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { loadEnvFile } from "node:process";
try {
  loadEnvFile(path.resolve("..", ".env"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const base = path.resolve("../dist");
const basePath = process.env.GITHUB_PAGES_BASE || "/";
const template = await readFile(path.join(base, "index.html"), "utf8");
const origin = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  "https://experimental-builder-lab-ak.ochreloach512.chatgpt.site"
).replace(/\/$/, "");
const pages = {
  "": "Engineering Portfolio",
  projects: "Selected Builds",
  about: "About the Builder",
  workshop: "The Workshop",
  "next-build": "The Next Impossible Idea",
  contact: "Let’s Build",
  "projects/gesture-controlled-robotic-hand":
    "Gesture-Controlled Robotic Hand — Concept",
  "projects/basketball-shooting-machine":
    "Automatic Basketball Shooting Machine — Concept",
  "projects/autonomous-mini-rover": "Autonomous Mini Rover — Concept",
};
for (const [route, title] of Object.entries(pages)) {
  const project = route.startsWith("projects/");
  const description = project
    ? `${title}. A proposed engineering build: explore the problem, approach, proposed components, and testing plan. No completed prototype has been verified.`
    : "An independent engineering portfolio. Explore robotics concept files, honest workshop notes, and the next impossible idea.";
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${title} — BUILT DIFFERENT</title>`)
    .replace(
      /<meta name="description"[^>]*\/>/,
      `<meta name="description" content="${description}"/>`,
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${origin}/${route}"/><meta property="og:url" content="${origin}/${route}"/></head>`,
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root"><main style="padding:60px;font-family:sans-serif"><h1>${title}</h1><p>${description}</p><nav><a href="${basePath}">Home</a> · <a href="${basePath}projects">Builds</a> · <a href="${basePath}about">About</a> · <a href="${basePath}workshop">Workshop</a> · <a href="${basePath}next-build">Next build</a> · <a href="${basePath}contact">Contact</a></nav></main></div>`,
    );
  const dir = path.join(base, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html);
}
await writeFile(
  path.join(base, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
    pages,
  )
    .map((route) => `<url><loc>${origin}/${route}</loc></url>`)
    .join("")}</urlset>`,
);
await writeFile(
  path.join(base, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(path.join(base, ".nojekyll"), "");
await writeFile(path.join(base, "404.html"), template);
console.log(
  "Static route metadata and crawlable concept summaries generated. Rebuild after changing portfolio routes.",
);
