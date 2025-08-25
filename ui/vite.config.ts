import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-api-delay',
      configureServer(server) {
        server.middlewares.use(async (req, _res, next) => {
          if (req.url?.startsWith('/api/')) {
            await new Promise((r) => setTimeout(r, 1000));
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
