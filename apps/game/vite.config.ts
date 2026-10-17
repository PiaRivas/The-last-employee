import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 5173 },
  build: {
    target: "es2022",
    // The Rapier compat build inlines its WASM as base64, so the chunk is large by design
    // (~1.8 MB gzip with Three.js). Revisit with the non-compat build if load time matters.
    chunkSizeWarningLimit: 5000,
  },
});
