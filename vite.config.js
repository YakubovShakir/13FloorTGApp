import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import * as dotenv from "dotenv"
import EnvironmentPlugin from 'vite-plugin-environment'
import polyfillNode from 'rollup-plugin-polyfill-node'

dotenv.config()
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),  polyfillNode(), EnvironmentPlugin('all', { loadEnvFiles: true })],
  server: {
    watch: {
      usePolling: true,
      useFsEvents: true
    }
  },
})
