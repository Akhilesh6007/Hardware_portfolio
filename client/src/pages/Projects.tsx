import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { type Project } from "../../../shared/src";
import { read } from "../services/api";
import {
  PageHead,
  ProjectCard,
  Loading,
  Failure,
  Empty,
  CallToAction,
} from "../components/ui/Common";
export default function Projects() {
  const [category, setCategory] = useState("All builds");
  const [search, setSearch] = useState("");
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Project[]>({
    queryKey: ["/projects"],
    queryFn: () => read("/projects"),
  });
  const filtered = data.filter(
    (p) =>
      (category === "All builds" || p.category === category) &&
      `${p.title} ${p.technologies.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHead
        label="THE BUILD ARCHIVE / 01"
        title="IDEAS MADE TANGIBLE."
        description="Explore the concept files. Each build starts with a question and earns its story through experimentation."
      />
      <section className="container section compact">
        <div className="filter-bar">
          <div className="filters">
            {["All builds", ...new Set(data.map((p) => p.category))].map(
              (c) => (
                <button
                  className={category === c ? "active" : ""}
                  key={c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ),
            )}
          </div>
          <label className="search">
            <Search size={16} />
            <input
              aria-label="Search builds"
              placeholder="Find a build..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <p className="micro muted archive-note">
          {filtered.length} BUILD FILES / CONCEPTS ARE LABELED UNTIL VERIFIED
        </p>
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <Failure retry={() => void refetch()} />
        ) : filtered.length ? (
          <div className="project-grid">
            {filtered.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
        ) : (
          <Empty title="No builds in this drawer.">
            Try another category or search term.
          </Empty>
        )}
      </section>
      <CallToAction />
    </>
  );
}
