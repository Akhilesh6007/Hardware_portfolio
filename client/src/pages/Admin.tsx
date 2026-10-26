import { useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Layers,
  NotebookPen,
  User,
  Mail,
  Settings,
  ArrowUpRight,
  LogOut,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Upload,
  FlaskConical,
} from "lucide-react";
import {
  sampleProjects,
  sampleSettings,
  projectSchema,
  profileSchema,
  logSchema,
  nextSchema,
  settingsSchema,
  type Project,
} from "../../../shared/src";
import { z } from "zod";
import { read, mutate, demo, errorText, api } from "../services/api";
import { Mark } from "../components/layout/Layout";
import { Loading, Empty } from "../components/ui/Common";
type Field = {
  key: string;
  label: string;
  type?: "area" | "list" | "boolean" | "date" | "select" | "image";
  options?: string[];
  help?: string;
};
const projectFields: Field[] = [
  { key: "title", label: "Project title" },
  {
    key: "slug",
    label: "URL slug",
    help: "Lowercase words separated by hyphens. Must be unique.",
  },
  { key: "shortDescription", label: "Short description", type: "area" },
  { key: "fullDescription", label: "Introduction", type: "area" },
  { key: "category", label: "Category" },
  {
    key: "status",
    label: "Build status",
    type: "select",
    options: ["Concept", "Planned Build", "In Progress", "Completed"],
  },
  { key: "technologies", label: "Technologies", type: "list" },
  { key: "components", label: "Bill of materials", type: "list" },
  { key: "coverImage", label: "Cover image URL", type: "image" },
  { key: "gallery", label: "Gallery image URLs", type: "list" },
  {
    key: "videoUrl",
    label: "Video URL",
    help: "YouTube, Vimeo, or hosted MP4/WebM.",
  },
  { key: "buildDate", label: "Build date (only if known)" },
  ...[
    "problem",
    "approach",
    "buildProcess",
    "failures",
    "lessonsLearned",
    "outcome",
    "futureImprovements",
  ].map((key) => ({
    key,
    label: (
      {
        problem: "The problem",
        approach: "Initial idea & approach",
        buildProcess: "Engineering process",
        failures: "What broke",
        lessonsLearned: "What I learned & changed",
        outcome: "Final outcome",
        futureImprovements: "Future improvements",
      } as Record<string, string>
    )[key],
    type: "area" as const,
  })),
  ...["githubUrl", "documentationUrl", "cadUrl", "schematicsUrl"].map(
    (key) => ({ key, label: key.replace("Url", " URL") }),
  ),
  {
    key: "featured",
    label: "Feature on homepage (first three published builds)",
    type: "boolean",
  },
  { key: "published", label: "Publish this build", type: "boolean" },
];
const logFields: Field[] = [
  { key: "title", label: "Entry title" },
  { key: "slug", label: "URL slug" },
  { key: "description", label: "What happened?", type: "area" },
  { key: "date", label: "Experiment date", type: "date" },
  { key: "category", label: "Category" },
  { key: "images", label: "Photo URLs", type: "list" },
  { key: "videoUrl", label: "Video URL" },
  { key: "tags", label: "Tags", type: "list" },
  { key: "relatedProject", label: "Related project slug" },
  { key: "lessonsLearned", label: "Lessons learned", type: "area" },
  { key: "published", label: "Publish this entry", type: "boolean" },
];
const profileFields: Field[] = [
  { key: "name", label: "Your name" },
  { key: "headline", label: "Headline" },
  { key: "biography", label: "Your story", type: "area" },
  { key: "location", label: "Location" },
  { key: "profileImage", label: "Profile image", type: "image" },
  { key: "heroContent.headline", label: "Homepage headline" },
  {
    key: "heroContent.description",
    label: "Homepage introduction",
    type: "area",
  },
  { key: "skills.Hardware", label: "Confirmed hardware skills", type: "list" },
  { key: "skills.Software", label: "Confirmed software skills", type: "list" },
  {
    key: "skills.Design & Prototyping",
    label: "Confirmed design skills",
    type: "list",
  },
  ...["GitHub", "LinkedIn", "Instagram", "YouTube", "Email"].map((k) => ({
    key: `socialLinks.${k}`,
    label: `${k} URL`,
    help:
      k === "Email"
        ? "Use mailto:you@example.com or an HTTPS contact link."
        : "",
  })),
  { key: "resumeUrl", label: "Resume URL" },
  { key: "showreelUrl", label: "Showreel URL" },
];
const nextFields: Field[] = [
  ...[
    "title",
    "description",
    "motivation",
    "technicalApproach",
    "challenges",
    "blockers",
    "firstSteps",
    "learningOutcomes",
  ].map((key) => ({
    key,
    label: (
      {
        title: "Next build name",
        description: "The idea",
        motivation: "Why I want to build it",
        technicalApproach: "Technical approach",
        challenges: "Engineering challenges",
        blockers: "What is stopping me",
        firstSteps: "What I would build first",
        learningOutcomes: "Expected learning outcomes",
      } as Record<string, string>
    )[key],
    type: "area" as const,
  })),
  { key: "requiredComponents", label: "Required components", type: "list" },
  { key: "conceptImages", label: "Concept image URLs", type: "list" },
  {
    key: "isExample",
    label: "Mark this as an example concept",
    type: "boolean",
  },
];
function get(obj: any, key: string): any {
  return key.split(".").reduce((o, k) => o?.[k], obj);
}
function set(obj: any, key: string, value: any) {
  const keys = key.split(".");
  let target = obj;
  keys.slice(0, -1).forEach((k) => {
    target[k] ??= {};
    target = target[k];
  });
  target[keys.at(-1)!] = value;
}
function ContentForm({
  initial,
  fields,
  schema,
  path,
  method = "patch",
  after,
}: {
  initial: any;
  fields: Field[];
  schema: z.ZodType;
  path: string;
  method?: "post" | "patch";
  after?: () => void;
}) {
  const [values, setValues] = useState<any>(() => structuredClone(initial));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const query = useQueryClient();
  const change = (key: string, value: any) =>
    setValues((prev: any) => {
      const copy = structuredClone(prev);
      set(copy, key, value);
      return copy;
    });
  async function upload(file: File, key: string) {
    setError("");
    if (
      file.size > 10 * 1024 * 1024 ||
      !["image/png", "image/jpeg", "image/webp", "image/avif"].includes(
        file.type,
      )
    ) {
      setError("Choose a JPEG, PNG, WebP, or AVIF image under 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const signed = await mutate("post", "/admin/media/sign");
      const body = new FormData();
      for (const k of ["timestamp", "folder", "signature", "api_key"])
        body.append(k, String(signed[k]));
      body.append("file", file);
      const result = await fetch(signed.uploadUrl, { method: "POST", body });
      const data = await result.json();
      if (!result.ok)
        throw new Error(data.error?.message || "Image upload failed.");
      change(key, data.secure_url);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="editor-form"
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();
        setSaved("");
        setError("");
        const result = schema.safeParse(values);
        if (!result.success) {
          setError(
            result.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("\n"),
          );
          return;
        }
        if (demo) {
          setError("Read-only demo. No changes were saved.");
          return;
        }
        setBusy(true);
        try {
          await mutate(method, path, result.data);
          await query.invalidateQueries();
          setSaved("Changes saved.");
          after?.();
        } catch (e) {
          setError(errorText(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="editor-fields">
        {fields.map((f) => (
          <label
            key={f.key}
            className={
              ["area", "list"].includes(f.type || "")
                ? "wide"
                : f.type === "boolean"
                  ? "check-label"
                  : ""
            }
          >
            <span>{f.label}</span>
            {f.type === "boolean" ? (
              <input
                type="checkbox"
                checked={!!get(values, f.key)}
                onChange={(e) => change(f.key, e.target.checked)}
              />
            ) : f.type === "select" ? (
              <select
                value={get(values, f.key) || ""}
                onChange={(e) => change(f.key, e.target.value)}
              >
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "area" || f.type === "list" ? (
              <textarea
                rows={f.type === "list" ? 3 : 4}
                value={
                  f.type === "list"
                    ? (get(values, f.key) || []).join("\n")
                    : get(values, f.key) || ""
                }
                onChange={(e) =>
                  change(
                    f.key,
                    f.type === "list"
                      ? e.target.value.split("\n")
                      : e.target.value,
                  )
                }
                onBlur={() => {
                  if (f.type === "list")
                    change(
                      f.key,
                      (get(values, f.key) || [])
                        .map((v: string) => v.trim())
                        .filter(Boolean),
                    );
                }}
              />
            ) : (
              <input
                type={f.type === "date" ? "date" : "text"}
                value={
                  f.type === "date"
                    ? (get(values, f.key) || "").slice(0, 10)
                    : get(values, f.key) || ""
                }
                onChange={(e) => change(f.key, e.target.value)}
              />
            )}
            <small>
              {f.help || (f.type === "list" ? "One entry per line." : "")}
            </small>
            {f.type === "image" && (
              <>
                <label className="upload-label">
                  <Upload size={14} />
                  Upload image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={demo || busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void upload(file, f.key);
                    }}
                  />
                </label>
                {get(values, f.key) && (
                  <img
                    className="editor-preview"
                    src={get(values, f.key)}
                    alt="Selected upload preview"
                  />
                )}
              </>
            )}
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="field-error preserve">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="success-message">
          {saved}
        </p>
      )}
      <div className="editor-save">
        <span className="micro muted">
          {demo
            ? "PREVIEW ONLY · SAVING IS DISABLED"
            : "CHANGES ARE STORED IN MONGODB"}
        </span>
        <button className="button primary" disabled={busy || demo}>
          <Save size={16} />
          {busy ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const query = useQueryClient();
  return (
    <div className="admin-login">
      <Link className="brand" to="/">
        <Mark />
        BUILT DIFFERENT
      </Link>
      <div className="login-card">
        <span className="eyebrow">THE CONTROL ROOM</span>
        <h1>Back to the bench.</h1>
        <p>Sign in to manage your builds, notes, and portfolio.</p>
        {demo && (
          <p className="demo-banner">
            Read-only demo. Connect MongoDB and run the admin bootstrap command
            to enable sign-in.
          </p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const f = new FormData(e.currentTarget);
            try {
              if (demo)
                throw new Error("Sign-in requires a configured backend.");
              await mutate("post", "/admin/login", {
                email: f.get("email"),
                password: f.get("password"),
              });
              await query.invalidateQueries({ queryKey: ["admin-me"] });
              navigate("/admin/dashboard");
            } catch (err) {
              setError(errorText(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy ? "Signing in..." : "Enter the control room"}
            <ArrowUpRight size={17} />
          </button>
        </form>
        {demo && (
          <Link className="inline-link" to="/admin/dashboard">
            Explore read-only dashboard <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      <Link className="inline-link" to="/">
        <ArrowLeft size={14} />
        Back to portfolio
      </Link>
    </div>
  );
}
function Dashboard({ projects, logs }: { projects: Project[]; logs: any[] }) {
  return (
    <>
      <div className="dashboard-stats">
        {[
          [projects.length, "BUILD FILES"],
          [projects.filter((p) => p.published).length, "PUBLISHED"],
          [logs.length, "WORKSHOP NOTES"],
        ].map(([n, t]) => (
          <div key={t}>
            <span className="micro muted">{t}</span>
            <strong>{String(n).padStart(2, "0")}</strong>
          </div>
        ))}
      </div>
      <div className="admin-welcome">
        <FlaskConical size={33} className="orange" />
        <h2>Make the portfolio yours.</h2>
        <p>
          Replace concept entries with documented work. Add your story, real
          project videos, and the idea you want to build next.
        </p>
        <div className="admin-quick-links">
          <Link to="/admin/profile">01 · Add your story ↗</Link>
          <Link to="/admin/projects">02 · Document a build ↗</Link>
          <Link to="/admin/next-build">03 · Share the next idea ↗</Link>
        </div>
      </div>
    </>
  );
}
function Messages() {
  const { data = [], isError } = useQuery<any[]>({
    queryKey: ["/admin/messages"],
    queryFn: () => read("/admin/messages"),
    enabled: !demo,
  });
  const query = useQueryClient();
  const [error, setError] = useState("");
  return (
    <>
      {error && <p className="field-error">{error}</p>}
      {isError ? (
        <p role="alert">Could not load messages.</p>
      ) : data.length ? (
        data.map((m) => (
          <article className="message-card" key={m._id}>
            <div>
              <h3>{m.subject}</h3>
              <select
                aria-label="Message status"
                value={m.status}
                onChange={async (e) => {
                  try {
                    await mutate("patch", `/admin/messages/${m._id}`, {
                      status: e.target.value,
                    });
                    await query.invalidateQueries({
                      queryKey: ["/admin/messages"],
                    });
                  } catch (err) {
                    setError(errorText(err));
                  }
                }}
              >
                {["unread", "read", "archived"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <p>
              {m.name} · {m.email} ·{" "}
              {new Date(m.createdAt).toLocaleDateString("en-IN")}
            </p>
            <p className="preserve">{m.message}</p>
          </article>
        ))
      ) : (
        <Empty title="An empty inbox.">
          {demo
            ? "Messages are disabled in the read-only preview."
            : "New contact messages will appear here."}
        </Empty>
      )}
    </>
  );
}
export default function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQueryClient();
  const path = location.pathname;
  const section = path.split("/")[2] || "dashboard";
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => api.get("/admin/me").then((r) => r.data),
    enabled: !demo && section !== "login",
    retry: false,
  });
  const enabled = demo || !!user;
  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery<Project[]>({
    queryKey: ["/admin/projects"],
    queryFn: () =>
      demo ? Promise.resolve(sampleProjects) : read("/admin/projects"),
    enabled,
  });
  const { data: logs = [] } = useQuery<any[]>({
    queryKey: ["/admin/build-logs"],
    queryFn: () => (demo ? Promise.resolve([]) : read("/admin/build-logs")),
    enabled,
  });
  const { data: profile } = useQuery({
    queryKey: ["/profile"],
    queryFn: () => read("/profile"),
    enabled,
  });
  const { data: next } = useQuery({
    queryKey: ["/next-build"],
    queryFn: () => read("/next-build"),
    enabled,
  });
  const { data: settings } = useQuery({
    queryKey: ["/settings"],
    queryFn: () => read("/settings"),
    enabled,
  });
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [error, setError] = useState("");
  if (section === "login") return <Login />;
  if (!demo && authLoading) return <Loading />;
  if (!enabled) return <Login />;
  const links = [
    ["dashboard", "Overview", LayoutDashboard],
    ["projects", "Build files", Layers],
    ["build-logs", "Workshop", NotebookPen],
    ["profile", "Profile & hero", User],
    ["next-build", "Next build", FlaskConical],
    ["messages", "Messages", Mail],
    ["settings", "Site settings", Settings],
  ] as const;
  const title = links.find((l) => l[0] === section)?.[1] || "Control room";
  const id = path.split("/")[3];
  const projectEditor =
    section === "projects" && (id === "new" || path.endsWith("/edit"));
  const logEditor =
    section === "build-logs" && (id === "new" || path.endsWith("/edit"));
  const current =
    section === "projects"
      ? projects.find((p) => (p._id || p.slug) === id)
      : logs.find((l) => (l._id || l.slug) === id);
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="brand" to="/">
          <Mark />
          <span>
            BUILT DIFFERENT<small>THE CONTROL ROOM</small>
          </span>
        </Link>
        <nav aria-label="Admin navigation">
          {links.map(([key, label, Icon]) => (
            <NavLink key={key} to={`/admin/${key}`}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="inline-link" to="/">
          View portfolio <ArrowUpRight size={16} />
        </Link>
        <button
          className="text-button"
          onClick={async () => {
            try {
              if (!demo) await mutate("post", "/admin/logout");
              query.clear();
              navigate("/admin/login");
            } catch (e) {
              setError(errorText(e));
            }
          }}
        >
          <LogOut size={15} />
          {demo ? "Exit preview" : "Sign out"}
        </button>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <span className="micro muted">WORKSPACE / {title.toUpperCase()}</span>
          <Link to="/" className="inline-link">
            Live site <ArrowUpRight size={15} />
          </Link>
        </div>
        {demo && (
          <div className="demo-banner">
            READ-ONLY DEMO · Explore the editors. Changes and messages are not
            persisted. Configure the backend to enable publishing.
          </div>
        )}
        <div className="admin-heading">
          <div>
            <span className="micro orange">YOUR INDEPENDENT BUILDER’S LAB</span>
            <h1>
              {projectEditor || logEditor
                ? id === "new"
                  ? "Start a new file."
                  : "Edit the build file."
                : title}
            </h1>
          </div>
          {["projects", "build-logs"].includes(section) &&
            !projectEditor &&
            !logEditor && (
              <Link className="button primary" to={`/admin/${section}/new`}>
                <Plus size={16} />
                New {section === "projects" ? "build" : "entry"}
              </Link>
            )}
        </div>
        {error && <p className="field-error">{error}</p>}
        {section === "dashboard" && (
          <Dashboard projects={projects} logs={logs} />
        )}
        {projectEditor || logEditor ? (
          projectsLoading ? (
            <Loading />
          ) : id !== "new" && !current ? (
            <Empty title="File not found.">Return to the file list.</Empty>
          ) : (
            <ContentForm
              key={path}
              initial={
                current ||
                (projectEditor
                  ? {
                      ...sampleProjects[0],
                      title: "",
                      slug: "",
                      shortDescription: "",
                      fullDescription: "",
                      problem: "",
                      approach: "",
                      components: [],
                      buildProcess: "",
                      failures: "",
                      lessonsLearned: "",
                      outcome: "",
                      futureImprovements: "",
                      featured: false,
                      published: false,
                    }
                  : {
                      title: "",
                      slug: "",
                      description: "",
                      date: new Date().toISOString().slice(0, 10),
                      images: [],
                      videoUrl: "",
                      category: "Experiment",
                      tags: [],
                      relatedProject: "",
                      lessonsLearned: "",
                      published: false,
                    })
              }
              fields={projectEditor ? projectFields : logFields}
              schema={projectEditor ? projectSchema : logSchema}
              path={
                id === "new"
                  ? `/admin/${section}`
                  : `/admin/${section}/${current?._id}`
              }
              method={id === "new" ? "post" : "patch"}
              after={() => navigate(`/admin/${section}`)}
            />
          )
        ) : (
          ["projects", "build-logs"].includes(section) && (
            <>
              {projectsError ? (
                <p role="alert">
                  Could not load build files. Refresh and try again.
                </p>
              ) : (section === "projects" ? projects : logs).length ? (
                <div className="admin-table">
                  {(section === "projects" ? projects : logs).map((p) => (
                    <div key={p._id || p.slug}>
                      <div>
                        <span className="micro orange">
                          {p.status || p.category} /{" "}
                          {p.published ? "PUBLISHED" : "DRAFT"}
                        </span>
                        <h3>{p.title}</h3>
                        <p className="muted">/{p.slug}</p>
                      </div>
                      <Link
                        className="button outline"
                        to={`/admin/${section}/${p._id || p.slug}/edit`}
                      >
                        Edit <ArrowUpRight size={15} />
                      </Link>
                      <button
                        className="icon-button"
                        disabled={demo}
                        onClick={() => setDeleteTarget(p)}
                        aria-label={`Delete ${p.title}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty title="A fresh notebook.">
                  Create your first entry to document a real experiment.
                </Empty>
              )}
            </>
          )
        )}
        {section === "profile" && profile && (
          <ContentForm
            key="profile"
            initial={profile}
            fields={profileFields}
            schema={profileSchema}
            path="/admin/profile"
          />
        )}
        {section === "next-build" && next && (
          <ContentForm
            key="next"
            initial={next}
            fields={nextFields}
            schema={nextSchema}
            path="/admin/next-build"
          />
        )}
        {section === "settings" && settings && (
          <ContentForm
            key="settings"
            initial={settings}
            fields={[
              { key: "siteTitle", label: "Site title" },
              {
                key: "metadata.description",
                label: "SEO description",
                type: "area",
              },
              { key: "footer", label: "Footer message" },
              { key: "contactInformation", label: "Contact information" },
              ...sampleSettings.navigation.flatMap((_n, i) => [
                {
                  key: `navigation.${i}.label`,
                  label: `Navigation ${i + 1} label`,
                },
                {
                  key: `navigation.${i}.path`,
                  label: `Navigation ${i + 1} path`,
                },
              ]),
            ]}
            schema={settingsSchema}
            path="/admin/settings"
          />
        )}
        {section === "messages" && <Messages />}
        {!links.some((l) => l[0] === section) && (
          <Empty title="Unknown control room page.">
            <Link to="/admin/dashboard">Back to overview</Link>
          </Empty>
        )}
      </div>
      {deleteTarget && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Delete record"
          >
            <h2>Delete this file?</h2>
            <p>“{deleteTarget.title}” will be permanently removed.</p>
            <div className="hero-actions">
              <button
                autoFocus
                className="button outline"
                onClick={() => setDeleteTarget(null)}
              >
                Keep file
              </button>
              <button
                className="button primary"
                onClick={async () => {
                  try {
                    await mutate(
                      "delete",
                      `/admin/${section}/${deleteTarget._id}`,
                    );
                    await query.invalidateQueries();
                    setDeleteTarget(null);
                  } catch (e) {
                    setError(errorText(e));
                    setDeleteTarget(null);
                  }
                }}
              >
                Delete file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
