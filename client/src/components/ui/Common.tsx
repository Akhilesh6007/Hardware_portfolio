import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowRight, Plus } from "lucide-react";
import { type Project } from "../../../../shared/src";
import TechnicalArt from "./TechnicalArt";
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -35px" }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span />
      {children}
    </p>
  );
}
export function PageHead({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="page-head container">
      <Eyebrow>{label}</Eyebrow>
      <h1>{title}</h1>
      {description && <p className="lead">{description}</p>}
    </section>
  );
}
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <Reveal className="project-card">
      <Link
        to={`/projects/${project.slug}`}
        className="project-cover"
        aria-label={`View ${project.title}`}
      >
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} loading="lazy" />
        ) : (
          <TechnicalArt
            kind={
              project.slug.includes("hand")
                ? "hand"
                : project.slug.includes("basketball")
                  ? "launcher"
                  : "rover"
            }
          />
        )}
        <span className="project-index">
          EXPERIMENT_{String(index + 1).padStart(2, "0")}
        </span>
        <span className="cover-arrow">
          <ArrowUpRight size={20} />
        </span>
        <span className="concept-label">
          {project.status}{" "}
          {project.status === "Concept" ? " / ILLUSTRATION" : ""}
        </span>
      </Link>
      <div className="project-meta">
        <span>{project.category}</span>
        <span>{String(index + 1).padStart(2, "0")} / BUILD FILE</span>
      </div>
      <h3>
        <Link to={`/projects/${project.slug}`}>{project.title}</Link>
      </h3>
      <p>{project.shortDescription}</p>
      <div className="tags">
        {project.technologies.slice(0, 3).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <Link className="project-link" to={`/projects/${project.slug}`}>
        Explore the build <ArrowRight size={16} />
      </Link>
    </Reveal>
  );
}
export function CallToAction() {
  return (
    <section className="cta container">
      <div>
        <Eyebrow>THE BEST IDEAS START WITH A CONVERSATION</Eyebrow>
        <h2>
          GOT A WILD IDEA?
          <br />
          <span>LET’S BUILD IT.</span>
        </h2>
      </div>
      <Link
        to="/contact"
        className="circle-link"
        aria-label="Start a conversation"
      >
        <ArrowUpRight size={42} />
      </Link>
    </section>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Plus size={26} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div
      className="container loading"
      role="status"
      aria-label="Loading content"
    >
      <div />
      <div />
      <div />
    </div>
  );
}
export function Failure({ retry }: { retry?: () => void }) {
  return (
    <div className="container empty-state" role="alert">
      <h2>Couldn’t load this file.</h2>
      <p>Check your connection and try again.</p>
      {retry && (
        <button onClick={retry} className="button">
          Try again
        </button>
      )}
    </div>
  );
}
export function Media({ url, title }: { url: string; title: string }) {
  let embed = "";
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be")
      embed = `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (["youtube.com", "www.youtube.com"].includes(u.hostname))
      embed = `https://www.youtube-nocookie.com/embed/${u.searchParams.get("v") || u.pathname.split("/").pop()}`;
    if (
      ["vimeo.com", "www.vimeo.com"].includes(u.hostname) &&
      /^\/\d+$/.test(u.pathname)
    )
      embed = `https://player.vimeo.com/video${u.pathname}`;
  } catch {
    /* Empty state below */
  }
  return !url ? (
    <Empty title="The proof comes with the prototype.">
      A real demonstration video will appear here when this build is documented.
    </Empty>
  ) : embed ? (
    <iframe
      className="video"
      src={embed}
      title={title}
      allow="fullscreen; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  ) : /\.(mp4|webm)(\?|$)/i.test(url) ? (
    <video
      className="video"
      controls
      preload="metadata"
      src={url}
      aria-label={title}
    />
  ) : (
    <a className="button" href={url} target="_blank" rel="noreferrer">
      Open video <ArrowUpRight size={17} />
    </a>
  );
}
