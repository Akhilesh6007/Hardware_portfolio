import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { Loading } from "./components/ui/Common";
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const About = lazy(() => import("./pages/About"));
const Workshop = lazy(() => import("./pages/Workshop"));
const NextBuild = lazy(() => import("./pages/NextBuild"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="about" element={<About />} />
          <Route path="workshop" element={<Workshop />} />
          <Route path="workshop/:slug" element={<Workshop />} />
          <Route path="next-build" element={<NextBuild />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
