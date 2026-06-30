import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    typecheck: {
      checker: "tsc",
      include: ["test/**/*.test-d.ts"],
      tsconfig: "test/tsconfig.json",
    },
  },
});
