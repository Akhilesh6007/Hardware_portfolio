import { useState, useEffect } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, ArrowUp, Menu, X, MoveUpRight } from "lucide-react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { read, demo } from "../../services/api";
import { sampleSettings } from "../../../../shared/src";
export function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <MoveUpRight size={21} />
      <span />
    </span>
  );
}
export default function Layout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const { data: settings = sampleSettings } = useQuery({
    queryKey: ["/settings"],
    queryFn: () => read("/settings"),
  });
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    const titles: Record<string, string> = {
      "/": "Engineering Portfolio",
      "/projects": "Selected Builds",
      "/about": "About the Builder",
      "/workshop": "The Workshop",
      "/next-build": "The Next Impossible Idea",
      "/contact": "Let’s Build",
    };
    const routeTitle =
      titles[location.pathname] ||
      location.pathname.split("/").pop()?.replaceAll("-", " ") ||
      "Build notes";
    document.title = `${routeTitle} — ${settings.siteTitle}`;
    const description = settings.metadata.description;
    const metadata = {
      'meta[name="description"]': description,
      'meta[property="og:title"]': document.title,
      'meta[property="og:description"]': description,
    };
    Object.entries(metadata).forEach(([selector, value]) => {
      document.querySelector(selector)?.setAttribute("content", value);
    });
  }, [location.pathname, settings.siteTitle, settings.metadata.description]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <motion.div
        className="scroll-progress"
        style={{ scaleX: reduced ? 0 : scrollYProgress }}
      />
      <header>
        <div className="nav-shell">
          <Link to="/" className="brand">
            <Mark />
            <span>
              {settings.siteTitle}
              <small>AN INDEPENDENT BUILDER’S LAB</small>
            </span>
          </Link>
          <nav aria-label="Main navigation" className={menu ? "open" : ""}>
            {settings.navigation.map((n: { path: string; label: string }) => (
              <NavLink key={n.path} to={n.path}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link className="nav-contact" to="/contact">
            Let’s talk <ArrowUpRight size={16} />
          </Link>
          <button
            className="menu-toggle"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer>
        <div className="footer-top">
          <Link to="/" className="brand">
            <Mark />
            <span>{settings.siteTitle}</span>
          </Link>
          <p>{settings.footer}</p>
          <button
            className="text-button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: reduced ? "instant" : "smooth",
              })
            }
          >
            Back to top <ArrowUp size={15} />
          </button>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} · THE INDEPENDENT BUILDER’S LAB
          </span>
          <span>
            {demo
              ? "DEMO PORTFOLIO · CONCEPTS, NOT CLAIMS"
              : "IDEAS → EXPERIMENTS → REALITY"}
          </span>
          <Link to="/contact">Made to make things. ↗</Link>
        </div>
      </footer>
    </>
  );
}
