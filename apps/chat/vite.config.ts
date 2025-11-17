import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  define: {
    global: 'globalThis',
  },
  server: {
    host: "chat.darevel.local",
    port: 3003,
    https: true,
    allowedHosts: ["chat.darevel.local"],
  }
});
