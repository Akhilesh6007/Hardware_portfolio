import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Check,
  FlaskConical,
} from "lucide-react";
import { type Project } from "../../../shared/src";
import { read } from "../services/api";
import { Eyebrow, Loading, Media, Reveal } from "../components/ui/Common";
import TechnicalArt from "../components/ui/TechnicalArt";
export default function ProjectDetail() {
  const { slug } = useParams();
  const {
    data: p,
    isLoading,
    isError,
  } = useQuery<Project>({
    queryKey: [`/projects/${slug}`],
    queryFn: () => read(`/projects/${slug}`),
  });
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/projects"],
    queryFn: () => read("/projects"),
  });
  if (isLoading) return <Loading />;
  if (!p || isError)
    return (
      <section className="page-head container">
        <h1>BUILD FILE UNAVAILABLE.</h1>
        <Link className="button" to="/projects">
          Back to builds
        </Link>
      </section>
    );
  const next =
    projects[
      (projects.findIndex((x) => x.slug === slug) + 1) % projects.length
    ];
  return (
    <>
      <section className="container detail-head">
        <Link className="inline-link" to="/projects">
          <ArrowLeft size={15} />
          Back to the archive
        </Link>
        <div className="detail-heading">
          <div>
            <Eyebrow>{p.category} / BUILD FILE</Eyebrow>
            <h1>{p.title}</h1>
            <p className="lead">{p.shortDescription}</p>
          </div>
          <span className="status-badge">
            <FlaskConical size={15} />
            {p.status}
          </span>
        </div>
        <div className="detail-tags">
          <div className="tags">
            {p.technologies.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <span className="micro muted">
            {p.buildDate || "BUILD DATE / NOT YET DOCUMENTED"}
          </span>
        </div>
      </section>
      <div className="container detail-cover">
        {p.coverImage ? (
          <img src={p.coverImage} alt={p.title} />
        ) : (
          <TechnicalArt
            kind={
              p.slug.includes("hand")
                ? "hand"
                : p.slug.includes("basketball")
                  ? "launcher"
                  : "rover"
            }
          />
        )}
        <span className="concept-label">
          {p.coverImage
            ? p.status
            : "CONCEPT ILLUSTRATION / NOT BUILD EVIDENCE"}
        </span>
      </div>
      <section className="container story-grid">
        <aside>
          <span className="micro orange">INSIDE THE BUILD</span>
          {[
            "The question",
            "The approach",
            "Components",
            "The process",
            "The iterations",
            "The outcome",
          ].map((s, i) => (
            <a key={s} href={`#story-${i}`}>
              {String(i + 1).padStart(2, "0")} — {s}
            </a>
          ))}
        </aside>
        <article>
          <p className="lead">{p.fullDescription}</p>
          <section className="story-section">
            <Eyebrow>SEE IT IN MOTION</Eyebrow>
            <Media url={p.videoUrl} title={`${p.title} demonstration`} />
          </section>
          {[
            ["The question.", p.problem],
            ["From idea to approach.", p.approach],
            ["The parts of the possibility.", p.components.join("\n")],
            ["From bench to build.", p.buildProcess],
            [
              "WHAT BROKE. WHAT I LEARNED. WHAT I CHANGED.",
              `${p.failures}\n\n${p.lessonsLearned}`,
            ],
            [
              "The outcome. And what’s next.",
              `${p.outcome}\n\n${p.futureImprovements}`,
            ],
          ].map(([title, body], i) => (
            <Reveal key={title} className="story-section">
              <section id={`story-${i}`}>
                <Eyebrow>0{i + 1} / FIELD NOTES</Eyebrow>
                <h2>{title}</h2>
                {i === 2 ? (
                  <ul className="component-list">
                    {p.components.map((c) => (
                      <li key={c}>
                        <Check size={14} />
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="preserve">
                    {body ||
                      "Documentation will be added as the build progresses."}
                  </p>
                )}
              </section>
            </Reveal>
          ))}
          {p.gallery.length > 0 && (
            <section className="story-section">
              <h2>From the bench.</h2>
              <div className="gallery">
                {p.gallery.map((img, i) => (
                  <img
                    key={img}
                    src={img}
                    alt={`${p.title} documentation ${i + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}
          <div className="resource-links">
            {[
              ["GitHub", p.githubUrl],
              ["Documentation", p.documentationUrl],
              ["CAD files", p.cadUrl],
              ["Schematics", p.schematicsUrl],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <a
                  className="button outline"
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noreferrer"
                >
                  {k}
                  <ArrowUpRight size={15} />
                </a>
              ))}
          </div>
        </article>
      </section>
      {next && (
        <Link className="next-project container" to={`/projects/${next.slug}`}>
          <div>
            <Eyebrow>KEEP EXPLORING / NEXT BUILD</Eyebrow>
            <h2>{next.title}</h2>
          </div>
          <ArrowRight size={36} />
        </Link>
      )}
    </>
  );
}
