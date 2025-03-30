import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import * as dotenv from "dotenv"
import EnvironmentPlugin from 'vite-plugin-environment'
import polyfillNode from 'rollup-plugin-polyfill-node'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject'
dotenv.config()
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), polyfillNode(), EnvironmentPlugin('all', { loadEnvFiles: true })],
  build: {
    rollupOptions: {
      plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
    },
  },
  server: {
    watch: {
      usePolling: true,
      useFsEvents: true
    }
  }
})
