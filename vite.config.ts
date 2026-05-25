import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" with { type: "json" };

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    target: "es2020",
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
});
