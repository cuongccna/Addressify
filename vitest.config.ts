import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/__tests__/**/*.{test,spec}.{ts,tsx}"]
  },
  resolve: {
    alias: {
      "@": srcDir
    }
  }
});
