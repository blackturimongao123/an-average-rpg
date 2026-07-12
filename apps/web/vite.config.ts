import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function readAppVersion(): string {
  const source = readFileSync(path.resolve(__dirname, "./src/constants/version.ts"), "utf8");
  const match = source.match(/APP_VERSION\s*=\s*["']([^"']+)["']/);
  return match?.[1] ?? "0.0.0";
}

const appVersion = readAppVersion();

export default defineConfig({
  plugins: [
    react(),
    {
      name: "inject-app-version",
      transformIndexHtml(html) {
        return html.replace(
          "<title>An Average RPG</title>",
          `<title>An Average RPG</title>\n    <meta name="app-version" content="${appVersion}" />`
        );
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  base: "/an-average-rpg/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@game-data": path.resolve(__dirname, "../../game-data"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) {
            return "firebase";
          }
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
