import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    host: "localhost",
    port: 3003,
    strictPort: true,  // Fail if port 3003 is not available
  }
});
