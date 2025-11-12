import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // We set the server root to be the project root
  // to match the existing file structure.
  root: '.',
  build: {
    // The output directory for the build.
    outDir: './dist'
  },
  // FIX: Implement a proxy to resolve network errors.
  // This tells the Vite dev server to forward any request to '/api'
  // to our backend server, which avoids all CORS and network routing issues.
  server: {
    port: 3002,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      // FIX: Add proxy for WebSocket connections to the backend server.
      // This is crucial for the real-time pod status updates to work in development.
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  // Use Vite's environment variables system instead of exposing process.env
  define: {
    // Empty define block as we're using import.meta.env instead
  }
})