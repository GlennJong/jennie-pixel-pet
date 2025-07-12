import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
  ],
  watch: {
    // usePolling: true,
    // interval: 1000, // increases delay
  },
  server: {
    host: true,
    port: 8000,
    sourcemap: true,
  },
});
