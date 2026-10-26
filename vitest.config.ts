import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["server/tests/**/*.test.ts", "client/tests/**/*.test.tsx"],
    testTimeout: 120000,
    hookTimeout: 120000,
    fileParallelism: false,
  },
});
