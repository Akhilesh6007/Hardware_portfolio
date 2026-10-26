# Delivery validation

Verified on 26 October 2026.

| Check | Result |
| --- | --- |
| TypeScript, frontend and backend | Passed |
| ESLint | Passed |
| Vitest + React Testing Library + Supertest | 19 tests passed |
| Isolated MongoDB integration | Passed: authentication, cookie attributes, CSRF, protected routes, project CRUD, workshop CRUD, profile/settings/next-build saves, contact storage and inbox status |
| Vite production build | Passed |
| Express production TypeScript build | Passed |
| npm dependency audit after patching | 0 reported vulnerabilities |
| Browser: desktop hero and archive | Visually inspected at 1440 × 1000 |
| Browser: project filter | Mechanical filter returned only the matching concept |
| Browser: mobile navigation | Open and close verified |
| Browser: mobile routes | Case study, About, Workshop, Next Build, Contact, admin dashboard rendered with no horizontal overflow at a 390-pixel viewport (375 pixels of document width after scrollbar) |

The build emits harmless warnings about two upstream Zod comments containing pure annotations; Rollup removes those comments. No build errors remain.

Live service credentials were not supplied. MongoDB Atlas, SMTP notification delivery, and Cloudinary uploads require configuration and were not tested against external accounts. The deployed preview is intentionally read-only, uses concept data, and does not claim that messages or edits were saved. No Lighthouse score is claimed. Build-time crawlable summaries cover the initial public routes; newly added CMS routes need an indexing rebuild as described in README.md.
