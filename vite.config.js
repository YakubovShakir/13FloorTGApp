import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import * as dotenv from "dotenv"
import EnvironmentPlugin from 'vite-plugin-environment'

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
dotenv.config()
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), EnvironmentPlugin('all', { loadEnvFiles: true })],
  server: {
    watch: {
      usePolling: true,
      useFsEvents: true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
            NodeGlobalsPolyfillPlugin({
                buffer: true
            })
        ]
    }
}
})
