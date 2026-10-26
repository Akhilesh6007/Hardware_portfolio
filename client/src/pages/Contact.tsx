import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ArrowRight, Mail } from "lucide-react";
import { z } from "zod";
import {
  contactSchema,
  sampleProfile,
  sampleSettings,
  type Profile,
} from "../../../shared/src";
import { api, read, demo, errorText } from "../services/api";
import { PageHead, Eyebrow } from "../components/ui/Common";
export default function Contact() {
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);
  const { data: p = sampleProfile } = useQuery<Profile>({
    queryKey: ["/profile"],
    queryFn: () => read("/profile"),
  });
  const { data: settings = sampleSettings } = useQuery({
    queryKey: ["/settings"],
    queryFn: () => read("/settings"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.input<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { website: "" },
  });
  return (
    <>
      <PageHead
        label="LET’S MAKE SOMETHING / 05"
        title="GOT A WILD IDEA? LET’S BUILD IT."
        description="A strange problem, an interesting opportunity, or a prototype waiting to happen. This is where it starts."
      />
      <section className="container contact-grid">
        <div>
          <Eyebrow>OPEN A CONVERSATION</Eyebrow>
          <h2>
            Great things rarely
            <br />
            start with a perfect plan.
          </h2>
          <p>Tell me what you’re thinking. A little context goes a long way.</p>
          {settings.contactInformation && (
            <p className="preserve">{settings.contactInformation}</p>
          )}
          <div className="social-links">
            {Object.entries(p.socialLinks)
              .filter(([, v]) => v)
              .map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noreferrer">
                  {key}
                  <ArrowUpRight size={18} />
                </a>
              ))}
          </div>
          {!Object.values(p.socialLinks).some(Boolean) && (
            <p className="micro muted">
              <Mail size={15} /> PERSONAL LINKS WILL BE ADDED HERE
            </p>
          )}
          <div className="contact-stamp">
            IDEAS WELCOME.
            <br />
            <span>IMPOSSIBLE OPTIONAL.</span>
          </div>
        </div>
        <form
          className="contact-form"
          onSubmit={handleSubmit(async (data) => {
            setFeedback("");
            setSuccess(false);
            try {
              if (demo)
                throw new Error(
                  "This preview is read-only. Your message was not sent or saved. Connect the Express API and MongoDB to enable delivery.",
                );
              const r = await api.post("/contact", data);
              setFeedback(r.data.message);
              setSuccess(true);
              reset();
            } catch (e) {
              setFeedback(errorText(e));
            }
          })}
          noValidate
        >
          <div className="form-row">
            {(["name", "email"] as const).map((key) => (
              <label key={key}>
                {key === "name" ? "Your name" : "Email address"}
                <input
                  aria-label={key === "name" ? "Your name" : "Email address"}
                  type={key === "email" ? "email" : "text"}
                  autoComplete={key}
                  placeholder={
                    key === "name"
                      ? "What should I call you?"
                      : "you@example.com"
                  }
                  {...register(key)}
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? `${key}-error` : undefined}
                />
                {errors[key] && (
                  <span id={`${key}-error`} className="field-error">
                    {errors[key].message}
                  </span>
                )}
              </label>
            ))}
          </div>
          <label>
            What’s on your mind?
            <input
              aria-label="Subject"
              placeholder="A project, an opportunity, an odd question..."
              {...register("subject")}
              aria-invalid={!!errors.subject}
              aria-describedby="subject-error"
            />
            {errors.subject && (
              <span id="subject-error" className="field-error">
                {errors.subject.message}
              </span>
            )}
          </label>
          <label>
            The details
            <textarea
              aria-label="The details"
              rows={6}
              placeholder="Tell me a little about your idea..."
              {...register("message")}
              aria-invalid={!!errors.message}
              aria-describedby="message-error"
            />
            {errors.message && (
              <span id="message-error" className="field-error">
                {errors.message.message}
              </span>
            )}
          </label>
          <div className="honeypot" aria-hidden="true">
            <label>
              Leave blank
              <input
                {...register("website")}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          {feedback && (
            <p
              role="status"
              className={success ? "success-message" : "field-error"}
            >
              {feedback}
            </p>
          )}
          <div className="form-submit">
            <span className="micro muted">
              {demo
                ? "DEMO MODE · MESSAGES ARE NOT SENT"
                : "YOUR MESSAGE GOES STRAIGHT TO THE BUILDER."}
            </span>
            <button className="button primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send message"}
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
