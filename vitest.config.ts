import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "https://mirabel.example/" } },
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.test.tsx"],
    clearMocks: true,
    restoreMocks: true,
  },
});
