import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3008,
        strictPort: true,  // Fail if port 3008 is not available
        host: '0.0.0.0',
        https: false,
        allowedHosts: [
          'localhost',
          'auth.darevel.local',
          'mail.darevel.local',
          'darevel.local',
          'chat.darevel.local',
          'drive.darevel.local',
          'sheet.darevel.local',
          'slides.darevel.local',
          'notify.darevel.local',
          'api.darevel.local',
          'keycloak.darevel.local',
        ],
      },
      plugins: [react(), basicSsl()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
