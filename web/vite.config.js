import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@locator/babel-jsx/dist',
            {
              env: 'development',
            },
          ],
        ],
      },
    }),
  ],
  server: {
    host: 'localhost',
    port: 3100,
    open: true,
    // Mirrors the nginx /v1/ proxy so VITE_URL_DB="/v1/" also works in dev.
    proxy: {
      '/v1': 'http://127.0.0.1:8000',
    },
  },
});
