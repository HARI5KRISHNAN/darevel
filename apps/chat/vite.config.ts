import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "chat.darevel.local",
    port: 3003,
    https: false,
    allowedHosts: ["chat.darevel.local"],
  }
});
