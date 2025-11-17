import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    host: "chat.darevel.local",
    port: 3003,
    https: false, // Disabled - requires Vite 6.x for basicSsl plugin
    allowedHosts: ["chat.darevel.local"],
  }
});
