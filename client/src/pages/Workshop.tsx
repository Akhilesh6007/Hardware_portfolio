import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowUpRight, NotebookPen } from "lucide-react";
import { type BuildLog } from "../../../shared/src";
import { read } from "../services/api";
import {
  PageHead,
  Empty,
  Loading,
  Failure,
  Media,
} from "../components/ui/Common";
export default function Workshop() {
  const { slug } = useParams();
  const [filter, setFilter] = useState("All notes");
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<BuildLog[]>({
    queryKey: ["/build-logs"],
    queryFn: () => read("/build-logs"),
  });
  const entry = data.find((l) => l.slug === slug);
  return (
    <>
      <PageHead
        label="FIELD NOTES / 03"
        title="THE WORKSHOP. WHERE IDEAS GET TESTED."
        description="The experiments, the circuit tests, the parts that didn’t quite fit. An honest notebook from the workbench."
      />
      <section className="container section compact">
        <div className="filter-bar">
          <div className="filters">
            {[
              "All notes",
              ...new Set(data.flatMap((l) => [l.category, ...l.tags])),
            ].map((c) => (
              <button
                className={filter === c ? "active" : ""}
                key={c}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="micro muted">
            <NotebookPen size={14} /> OPEN NOTEBOOK
          </span>
        </div>
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <Failure retry={() => void refetch()} />
        ) : slug && !entry ? (
          <Empty title="Note not found.">
            This entry may be unpublished.{" "}
            <Link to="/workshop">Return to the notebook.</Link>
          </Empty>
        ) : entry ? (
          <article className="log-detail">
            <span className="micro orange">
              {new Date(entry.date).toLocaleDateString("en-IN")}
            </span>
            <h2>{entry.title}</h2>
            <p className="lead preserve">{entry.description}</p>
            <div className="gallery">
              {entry.images.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt={`${entry.title} photo ${i + 1}`}
                  loading="lazy"
                />
              ))}
            </div>
            {entry.videoUrl && (
              <Media url={entry.videoUrl} title={entry.title} />
            )}
            <h3>What this taught me.</h3>
            <p className="preserve">{entry.lessonsLearned}</p>
            {entry.relatedProject && (
              <Link
                className="inline-link"
                to={`/projects/${entry.relatedProject}`}
              >
                Related build <ArrowUpRight size={16} />
              </Link>
            )}
          </article>
        ) : data.length ? (
          <div className="timeline">
            {data
              .filter(
                (l) =>
                  filter === "All notes" ||
                  l.category === filter ||
                  l.tags.includes(filter),
              )
              .map((l) => (
                <article key={l.slug}>
                  <time>{new Date(l.date).toLocaleDateString("en-IN")}</time>
                  <div>
                    <span className="micro orange">{l.category}</span>
                    <h2>
                      <Link to={`/workshop/${l.slug}`}>{l.title} ↗</Link>
                    </h2>
                    <p>{l.description.slice(0, 240)}</p>
                    <div className="tags">
                      {l.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <div className="notebook-empty">
            <div className="notebook-lines" />
            <span className="micro orange">
              ENTRY_001 / A BLANK PAGE, BY DESIGN
            </span>
            <h2>
              GOOD NOTES START
              <br />
              WITH A REAL EXPERIMENT.
            </h2>
            <p>
              No workshop entries have been published yet. This space is
              reserved for actual tests, observations, failures, and the lessons
              that follow.
            </p>
            <Link className="inline-link" to="/projects">
              Explore the concept files <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
