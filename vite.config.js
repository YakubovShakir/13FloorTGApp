import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as dotenv from "dotenv";
import EnvironmentPlugin from "vite-plugin-environment";
import polyfillNode from "rollup-plugin-polyfill-node";

dotenv.config();

export default defineConfig({
  plugins: [
    react(), // Ensures React imports and JSX are handled
    polyfillNode(), // Polyfills Buffer and other Node.js globals
    EnvironmentPlugin("all", { loadEnvFiles: true }),
  ],
  server: {
    watch: {
      usePolling: true,
      useFsEvents: true,
    },
  },
});