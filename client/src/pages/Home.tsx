import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ArrowRight,
  Play,
  Download,
  ArrowDown,
  MoveUpRight,
  X,
  Radio,
  Cpu,
  Wrench,
  Code2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { read } from "../services/api";
import { sampleProfile, type Project } from "../../../shared/src";
import TechnicalArt from "../components/ui/TechnicalArt";
import {
  Reveal,
  Eyebrow,
  ProjectCard,
  CallToAction,
  Media,
  Loading,
  Failure,
} from "../components/ui/Common";
export default function Home() {
  const { data: profile = sampleProfile } = useQuery({
    queryKey: ["/profile"],
    queryFn: () => read("/profile"),
  });
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
  } = useQuery<Project[]>({
    queryKey: ["/projects/featured"],
    queryFn: () => read("/projects/featured"),
  });
  const [showreel, setShowreel] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  return (
    <>
      <section
        className="hero container"
        onMouseMove={(e) => {
          if (!reduced && window.matchMedia("(pointer:fine)").matches) {
            const r = e.currentTarget.getBoundingClientRect();
            setPointer({
              x: (e.clientX - r.left - r.width / 2) / 65,
              y: (e.clientY - r.top - r.height / 2) / 65,
            });
          }
        }}
        onMouseLeave={() => setPointer({ x: 0, y: 0 })}
      >
        <div className="hero-copy">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Eyebrow>{profile.headline.toUpperCase()}</Eyebrow>
            <h1>
              {profile.heroContent.headline ===
              sampleProfile.heroContent.headline ? (
                <>
                  I BUILD THINGS
                  <br />
                  THAT <span>SHOULDN’T</span>
                  <br />
                  EXIST<span className="orange">.</span>
                </>
              ) : (
                profile.heroContent.headline
              )}
            </h1>
            <p className="hero-description">
              {profile.heroContent.description}
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/projects">
                Explore my builds <ArrowUpRight size={18} />
              </Link>
              <button
                className="button quiet"
                onClick={() => setShowreel(true)}
              >
                <span className="play-icon">
                  <Play size={12} fill="currentColor" />
                </span>
                Watch the showreel
              </button>
            </div>
            <div className="hero-note">
              <span className="status-dot" />
              CURIOUS MIND. HANDS-ON APPROACH.
              <span className="note-separator">/</span>
              {profile.resumeUrl ? (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                  RESUME <Download size={12} />
                </a>
              ) : (
                <span title="Add a resume URL in admin settings">
                  RESUME COMING SOON
                </span>
              )}
            </div>
          </motion.div>
        </div>
        <motion.div
          className="hero-visual"
          animate={{ x: pointer.x, y: pointer.y }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        >
          <div className="visual-corner top-left" />
          <div className="visual-corner bottom-right" />
          <span className="visual-code">BD / EXPERIMENTAL SYSTEMS</span>
          <TechnicalArt />
          <div className="art-caption">
            <span className="orange">+</span> ARTICULATED POSSIBILITIES
            <span>CONCEPT VISUAL · NOT A COMPLETED BUILD</span>
          </div>
          <span className="floating-label">
            <span /> FIG_001
            <br />
            <small>IDEA → PROTOTYPE</small>
          </span>
        </motion.div>
        <div className="hero-bottom">
          <a href="#selected-builds">
            <ArrowDown size={15} />
            SCROLL TO EXPLORE
          </a>
          <span>BUILT WITH CURIOSITY. HELD TOGETHER BY ITERATION.</span>
          <span>01 — ∞</span>
        </div>
      </section>
      <div className="discipline-strip">
        <div className="container">
          <span>IDEAS ARE JUST THE BEGINNING.</span>
          {[
            [Cpu, "ROBOTICS"],
            [Radio, "ELECTRONICS"],
            [Wrench, "PROTOTYPING"],
            [Code2, "CREATIVE CODE"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Cpu;
            return (
              <span key={String(label)}>
                <I size={17} />
                {String(label)}
              </span>
            );
          })}
        </div>
      </div>
      <section className="section container" id="selected-builds">
        <Reveal className="section-heading">
          <div>
            <Eyebrow>01 / SELECTED BUILDS</Eyebrow>
            <h2>
              LESS TALK.
              <br />
              <span>MORE TINKERING.</span>
            </h2>
          </div>
          <div className="section-heading-right">
            <p>
              Three ideas. Three different challenges.
              <br />A starting point for things worth building.
            </p>
            <Link className="inline-link" to="/projects">
              View all builds <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>
        <div className="concept-notice">
          <span className="status-dot" />
          THE CONCEPT FILES{" "}
          <span>
            Proposed builds. Real evidence will follow real experiments.
          </span>
        </div>
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <Failure retry={() => void refetch()} />
        ) : (
          <div className="project-grid">
            {projects?.slice(0, 3).map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
        )}
      </section>
      <section className="philosophy">
        <div className="container philosophy-grid">
          <Reveal>
            <Eyebrow>02 / THE BUILDER’S MINDSET</Eyebrow>
            <h2>
              THE BEST WAY
              <br />
              TO UNDERSTAND IT?
              <br />
              <span>TAKE IT APART.</span>
            </h2>
            <Link className="inline-link" to="/about">
              Meet the mind behind the builds <ArrowUpRight size={18} />
            </Link>
          </Reveal>
          <div className="principles">
            {[
              [
                "01",
                "Stay curious.",
                "Ask the odd question. Follow the interesting problem. There is usually something worth making on the other side.",
              ],
              [
                "02",
                "Make it tangible.",
                "A sketch is a start. A rough prototype is a conversation with reality. Get an idea off the screen and onto the bench.",
              ],
              [
                "03",
                "Break. Learn. Repeat.",
                "Treat every failed test as a useful clue. Document the mistake, change one thing, and try again.",
              ],
            ].map(([n, t, d]) => (
              <Reveal className="principle" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
                <MoveUpRight size={19} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section container next-teaser">
        <Reveal>
          <Eyebrow>03 / STILL ON THE DRAWING BOARD</Eyebrow>
          <h2>
            THE NEXT
            <br />
            <span>IMPOSSIBLE IDEA.</span>
          </h2>
          <p>
            What if a machine could explore the world with a little curiosity of
            its own?
          </p>
          <Link className="button outline" to="/next-build">
            Inside the next build <ArrowUpRight size={18} />
          </Link>
          <span className="micro muted">
            EXAMPLE CONCEPT / OPEN QUESTIONS INCLUDED
          </span>
        </Reveal>
        <div className="next-diagram">
          <TechnicalArt kind="rover" />
          <span className="diagram-tag">SENSE → THINK → MOVE → REPEAT</span>
        </div>
      </section>
      <section className="workshop-teaser container">
        <div>
          <Eyebrow>04 / NOTES FROM THE BENCH</Eyebrow>
          <h3>Messy process. Honest notes.</h3>
          <p>
            The tests, the wrong turns, and the little discoveries in between.
          </p>
        </div>
        <Link className="inline-link" to="/workshop">
          Enter the workshop <ArrowRight size={20} />
        </Link>
      </section>
      <CallToAction />
      {showreel && (
        <div className="modal-backdrop" onClick={() => setShowreel(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="showreel-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowreel(false);
              if (e.key === "Tab" && !profile.showreelUrl) {
                e.preventDefault();
                e.currentTarget.querySelector("button")?.focus();
              }
            }}
          >
            <button
              autoFocus
              className="modal-close"
              onClick={() => setShowreel(false)}
              aria-label="Close showreel"
            >
              <X />
            </button>
            <Eyebrow>THE BUILD REEL</Eyebrow>
            <h2 id="showreel-title">Ideas deserve evidence.</h2>
            <Media url={profile.showreelUrl} title="Builder showreel" />
          </section>
        </div>
      )}
    </>
  );
}
