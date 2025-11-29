import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_PORT = 3007;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.DASHBOARD_FRONTEND_PORT ?? DEFAULT_PORT);

  return {
    server: {
      host: '0.0.0.0',
      port,
      strictPort: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    envPrefix: ['VITE_', 'DASHBOARD_'],
  };
});
