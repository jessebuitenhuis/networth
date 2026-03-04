import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    dangerouslyIgnoreUnhandledErrors: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", ".worktrees", ".claude"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/db/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.type.ts",
        "src/**/*.page.{ts,tsx}",
        "src/app/layout.tsx",
        "src/lib/utils.ts",
        "src/components/ui/**",
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
