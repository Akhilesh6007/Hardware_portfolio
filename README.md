# BUILT DIFFERENT — An independent builder’s lab

React + Vite + TypeScript frontend, Express + TypeScript API, and MongoDB/Mongoose content management. Designed for a hands-on engineering application, with three explicitly labeled concept projects and original SVG technical illustrations. No biography, completed projects, test results, or external project links are fabricated.

## Local development

Requires Node.js 22.12+ and npm. From this directory:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:4000/api/v1. Default demo mode uses bundled public concept data. Contact submissions and admin writes are explicitly disabled; nothing is falsely acknowledged as saved. `/admin/login` links to a read-only dashboard preview.

## Enable the real backend

1. Create a dedicated MongoDB Atlas database and database user. Restrict network access to your backend host.
2. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and `CLIENT_ORIGIN` (exact frontend origin, no trailing slash). For local use, include both `http://localhost:5173,http://127.0.0.1:5173` if needed.
3. Set `VITE_DEMO_MODE=false`. Keep `VITE_API_URL=/api/v1` for local Vite proxying; use your HTTPS API URL for separate hosting. Vite variables are public, embedded at build time, and require rebuilding after changes.
4. Bootstrap the admin:

```powershell
# Put ADMIN_EMAIL and a unique ADMIN_PASSWORD (12+ characters) in .env.
npm run bootstrap
npm run seed
# Remove ADMIN_PASSWORD from .env once the account exists.
npm run dev
```

No registration endpoint exists. Bootstrap refuses to overwrite an existing account. Seed inserts missing concepts and singleton content without overwriting edits. Sign in at `/admin/login`.

### Content workflow

Use the control room to create, edit, publish, unpublish, and delete projects and workshop entries; manage gallery URLs and proposed or actual components; edit profile, confirmed skills, social links, resume, hero and showreel; edit the next build, navigation labels, footer, and metadata; and read/archive messages. Only published entries reach public APIs. Mark completed builds only after adding actual evidence. The homepage takes the first three featured published projects. Newest entries appear first. Keep exactly three projects featured for the intended layout.

Videos support YouTube, Vimeo, and hosted MP4/WebM. Other video URLs open in a new tab. No media autoplays. Image URLs must use HTTP(S). Optional signed Cloudinary image uploads accept JPEG/PNG/WebP/AVIF up to 10 MB on the client. Configure provider-side restricted image formats, maximum size, moderation, and retention as appropriate; the adapter signs the fixed `builder-portfolio` folder for authenticated admins. Videos remain external and are never stored in MongoDB.

## Configuration

| Variable                                                                                    | Purpose                                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `MONGODB_URI`                                                                               | Required for real persistence; absent means read-only API demo      |
| `JWT_SECRET`                                                                                | Required in database mode, 32+ random characters                    |
| `CLIENT_ORIGIN`                                                                             | Comma-separated allowed frontend origins, used by CORS and CSRF     |
| `PORT`                                                                                      | API port, default 4000                                              |
| `NODE_ENV`                                                                                  | `production` enables Secure cookies; production requires HTTPS      |
| `TRUST_PROXY`                                                                               | Set `1` only behind one trusted reverse proxy, such as Render       |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`                                                             | Explicit bootstrap only; never bundled into the client              |
| `VITE_DEMO_MODE`                                                                            | Default true. Set false for the production API                      |
| `VITE_API_URL`                                                                              | Public API base, including `/api/v1`                                |
| `SITE_URL`                                                                                  | Frontend canonical origin for build-time sitemap and metadata       |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `CONTACT_NOTIFY_EMAIL` | Optional email notifications. Messages remain stored if email fails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`                      | Optional image upload provider adapter                              |

Only variables prefixed `VITE_` belong in the browser. Never expose database, JWT, SMTP, or Cloudinary secrets.

## Validation

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Vitest uses Supertest against the actual Express app. Integration tests launch an isolated MongoDB using mongodb-memory-server, including login/logout, CSRF, protected endpoints, project CRUD, and contact storage. The first test run downloads a MongoDB test binary and needs network access. React Testing Library covers project filtering, case-study links, contact validation, and mobile-menu state.

## Deployment

### GitHub repository and GitHub Pages

The complete frontend, Express backend, MongoDB models, tests, and deployment configuration belong in this repository. `.env` and dependencies are excluded; `.env.example` is safe to commit.

The `Verify portfolio` workflow checks types, lint, all tests, and the production build. The Pages workflow builds a read-only concept preview at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` and includes support for repository subpaths and direct route reloads. Enable it in **Settings → Pages → Build and deployment → Source → GitHub Actions**. Pushes to `main` then build and publish the frontend automatically. Keep the Express API on Render (or another Node host) and MongoDB on Atlas; GitHub Pages cannot run the backend or database.

To test the Pages build locally from PowerShell:

```powershell
$env:GITHUB_PAGES_BASE='/builder-portfolio/'
$env:SITE_URL='https://YOUR-USERNAME.github.io/builder-portfolio'
npm run build
npm exec -w client -- vite preview --host 127.0.0.1 --port 4173
# Open http://127.0.0.1:4173/builder-portfolio/
# Clear GITHUB_PAGES_BASE and SITE_URL afterward to return to the default build.
```

### Frontend: Vercel

Import `Akhilesh6007/Hardware_portfolio` into the existing `client` project. In **Settings → Build and Deployment**, leave **Root Directory** empty so Vercel builds from the monorepo root. The tracked `vercel.json` selects Vite, installs with `npm ci`, builds with `npm run build -w client`, publishes the root `dist` directory, and rewrites direct React Router URLs to the app shell. Do not set Root Directory to `client`: the shared build output is outside that directory.

The initial Vercel deployment serves the same read-only concept portfolio as GitHub Pages. For the live Express API, deploy `server/` using the Render instructions and configure `VITE_DEMO_MODE=false` plus `VITE_API_URL` before rebuilding. Admin cookies require same-site hosting or a same-origin API proxy, as explained below. Never put backend secrets in Vite variables.

Set `SITE_URL` to your preferred custom domain when one is added. Otherwise, Vercel's `VERCEL_PROJECT_PRODUCTION_URL` is used for canonical URLs and the sitemap. Leave `GITHUB_PAGES_BASE` unset on Vercel; only the GitHub Pages workflow sets that repository subpath.

### Frontend: Netlify

Import the repository with `netlify.toml`. Build: `npm run build -w client`; publish `dist`. Set `VITE_DEMO_MODE=false`, `VITE_API_URL=https://YOUR-API/api/v1`, and `SITE_URL=https://YOUR-FRONTEND`. For the most reliable cookie authentication, reverse-proxy `/api` to Express on the same site, and use `/api/v1` as the frontend API URL.

### Backend: Render

Use `render.yaml` or create a Node web service. Build `npm ci && npm run build -w server`; start `npm start -w server`. Set MongoDB URI, secret, exact frontend origins, and HTTPS production settings. Run the bootstrap and seed commands in a trusted one-off environment connected to the same database. Never commit credentials.

### Cookies across hosting domains

The secure default is HttpOnly, Secure in production, SameSite=Lax, eight-hour JWT expiry, and an admin API cookie path. The frontend and API should be same-site, ideally with a same-origin `/api` proxy or subdomains of your own domain. Unrelated Netlify and Render domains are cross-site; default browser cookie restrictions will block authenticated requests. Configure a same-site deployment instead of weakening cookie protections. CSRF requires an allowed Origin and a server-issued token on all admin mutations, including login.

### Preview hosting

The Sites preview hosts the built frontend in explicit read-only demo mode. Sites runs Cloudflare Workers and cannot host this Express/MongoDB server directly. The ZIP contains the full server and deployment configuration for Render/Atlas. No external service credentials were supplied.

### SEO and operational notes

The build generates index documents, unique titles, canonical URLs, concept summaries, sitemap, and robots rules for initial public routes. The app loads live content client-side. If adding new published project routes in MongoDB, rebuild and extend `client/scripts/prerender.mjs` for search indexing; full live-data SSR is not implemented. Keep `robots.txt` sitemap origin current when using a different domain. Admin pages are excluded from crawling, but authentication—not robots rules—protects data.

### Troubleshooting

- API offline: check `/api/v1/health`, MongoDB IP allowlist, and backend logs.
- Login receives 403: check exact `CLIENT_ORIGIN`, CSRF token/cookies, HTTPS and proxy origin headers.
- Login succeeds but session disappears: check same-site hosting and `withCredentials`.
- Content edits do not appear: check published/featured flags, API URL, demo mode, and frontend rebuild.
- Contact email fails: the message remains saved; inspect SMTP settings. The API returns notification status without credentials.
- Upload disabled: configure Cloudinary or paste a hosted image URL.

## Limitations and honest states

No personal resume, video, portrait, skills, or social handles were supplied. Empty states are deliberate. The workshop has no invented entries. Production MongoDB Atlas, SMTP, and Cloudinary need your configuration; isolated tests do not verify those external accounts. Build-time crawlable summaries cover the initial concepts, not dynamically added CMS records. A production security review, external-service smoke test, and Lighthouse audit are recommended before accepting public traffic.
