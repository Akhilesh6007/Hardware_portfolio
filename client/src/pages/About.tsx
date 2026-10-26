import { useQuery } from "@tanstack/react-query";
import { read } from "../services/api";
import { sampleProfile, type Profile } from "../../../shared/src";
import {
  PageHead,
  Eyebrow,
  Reveal,
  CallToAction,
  Empty,
} from "../components/ui/Common";
import { Cpu, Code2, Wrench, ArrowUpRight } from "lucide-react";
export default function About() {
  const { data: p = sampleProfile } = useQuery<Profile>({
    queryKey: ["/profile"],
    queryFn: () => read("/profile"),
  });
  return (
    <>
      <PageHead
        label="MEET THE BUILDER / 02"
        title="CURIOUS BY NATURE. BUILDER BY OBSESSION."
      />
      <section className="container about-grid">
        <Reveal className="about-portrait">
          {p.profileImage ? (
            <img src={p.profileImage} alt={p.name} />
          ) : (
            <>
              <div className="portrait-symbol">
                <Wrench size={100} strokeWidth={0.7} />
              </div>
              <span className="micro">THE PERSON BEHIND THE PROTOTYPES</span>
              <p>
                YOUR STORY
                <br />
                STARTS HERE<span className="orange">.</span>
              </p>
              <span className="micro muted">PROFILE PHOTO TO BE ADDED</span>
            </>
          )}
        </Reveal>
        <Reveal>
          <Eyebrow>WHO I AM</Eyebrow>
          <h2>{p.name}</h2>
          <p className="lead preserve">{p.biography}</p>
          {p.location !== sampleProfile.location && (
            <p className="micro muted">BASED IN / {p.location}</p>
          )}
          <div className="about-note">
            <span className="orange">↗</span>
            <p>
              This portfolio is built for real stories. The biography, skills,
              and links become personal when the owner adds them.
            </p>
          </div>
          {p.resumeUrl && (
            <a
              href={p.resumeUrl}
              className="button outline"
              target="_blank"
              rel="noreferrer"
            >
              Download resume <ArrowUpRight size={17} />
            </a>
          )}
        </Reveal>
      </section>
      <section className="section container">
        <Eyebrow>THE WAY I WORK</Eyebrow>
        <div className="about-values">
          {[
            [
              "01 / WHY BUILD",
              "Make the question physical.",
              "The most interesting engineering happens where an idea meets real-world constraints.",
            ],
            [
              "02 / THE APPROACH",
              "Start small. Test honestly.",
              "Define a question, isolate the riskiest assumption, and create the smallest experiment that can teach something useful.",
            ],
            [
              "03 / THE JOURNEY",
              "Keep a record. Keep going.",
              "A build log is a place for observations, revisions, and evidence. The next experiment starts with what the last one taught.",
            ],
          ].map(([label, title, body]) => (
            <Reveal key={label}>
              <Eyebrow>{label}</Eyebrow>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="container section compact">
        <Eyebrow>TOOLS OF THE TRADE / CONFIRMED SKILLS</Eyebrow>
        <h2>A TOOLBOX THAT KEEPS GROWING.</h2>
        <div className="skill-grid">
          {Object.entries(p.skills).map(([group, skills], i) => {
            const Icon = [Cpu, Code2, Wrench][i];
            return (
              <Reveal key={group} className="skill-card">
                <Icon className="orange" size={26} />
                <h3>{group}</h3>
                {skills.length ? (
                  <div className="tags">
                    {skills.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                ) : (
                  <p>Confirmed skills will be added by the portfolio owner.</p>
                )}
              </Reveal>
            );
          })}
        </div>
        <Empty title="The next thing to learn?">
          Learning goals will be documented alongside real experiments in the
          workshop.
        </Empty>
      </section>
      <CallToAction />
    </>
  );
}
