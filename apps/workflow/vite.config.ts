import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_PORT = 3006;

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.WORKFLOW_FRONTEND_PORT) || DEFAULT_PORT,
    host: '0.0.0.0',
    strictPort: true,
  },
});
