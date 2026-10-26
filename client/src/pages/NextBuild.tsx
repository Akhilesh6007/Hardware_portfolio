import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { read } from "../services/api";
import { sampleNext } from "../../../shared/src";
import TechnicalArt from "../components/ui/TechnicalArt";
import { PageHead, Eyebrow, Reveal } from "../components/ui/Common";
export default function NextBuild() {
  const { data: n = sampleNext } = useQuery<typeof sampleNext>({
    queryKey: ["/next-build"],
    queryFn: () => read("/next-build"),
  });
  return (
    <>
      <PageHead
        label="THE DRAWING BOARD / 04"
        title="THE NEXT IMPOSSIBLE IDEA."
      />
      <section className="container next-feature">
        <div>
          <span className="status-badge">
            {n.isExample ? "EXAMPLE CONCEPT" : "PLANNED BUILD"}
          </span>
          <h2>{n.title}</h2>
          <p className="lead">{n.description}</p>
          <a className="inline-link" href="#next-plan">
            Inside the idea <ArrowDown size={16} />
          </a>
        </div>
        <TechnicalArt kind="rover" />
      </section>
      <section className="container next-plan" id="next-plan">
        {[
          ["01", "Why build it?", n.motivation],
          ["02", "The technical approach.", n.technicalApproach],
          ["03", "The hard questions.", n.challenges],
          ["04", "What’s stopping me.", n.blockers],
          ["05", "The first experiment.", n.firstSteps],
          ["06", "What I hope to learn.", n.learningOutcomes],
        ].map(([num, title, body]) => (
          <Reveal
            className={`plan-item ${num === "04" ? "blockers" : ""}`}
            key={num}
          >
            <Eyebrow>{num} / TECHNICAL NOTES</Eyebrow>
            <h3>{title}</h3>
            <p className="preserve">{body}</p>
          </Reveal>
        ))}
      </section>
      <section className="container components-section">
        <Eyebrow>THE PROPOSED TOOLBOX</Eyebrow>
        <h2>PARTS OF THE POSSIBILITY.</h2>
        <div className="tags">
          {n.requiredComponents.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        {n.conceptImages.length > 0 && (
          <div className="gallery">
            {n.conceptImages.map((im, i) => (
              <img
                src={im}
                key={im}
                alt={`Next build concept sketch ${i + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        )}
        <Link className="button primary" to="/contact">
          Help bring it off the drawing board <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}
