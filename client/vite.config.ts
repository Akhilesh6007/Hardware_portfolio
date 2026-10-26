import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  envDir: "..",
  base: process.env.GITHUB_PAGES_BASE || "/",
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy: { "/api": "http://127.0.0.1:4000" } },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/zod/")) return "validation";
          if (/\/(framer-motion|motion-dom|motion-utils)\//.test(id))
            return "motion";
          if (/\/(react|react-dom|scheduler)\//.test(id)) return "react";
        },
      },
    },
  },
});
