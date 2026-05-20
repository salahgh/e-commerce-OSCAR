import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET

  return {
    plugins: [react()],
    server: proxyTarget
      ? {
          proxy: {
            // /admin-api → VPS Vendure admin API.
            // We deliberately do NOT proxy /assets here because the SPA has a
            // React Router page at /assets; image URLs are absolute
            // (https://api.oscarfashion.dz/assets/...) so they don't need a
            // dev proxy.
            '/admin-api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              ws: true,
            },
          },
        }
      : undefined,
  }
})
