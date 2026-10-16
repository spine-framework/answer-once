import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// CIL[BEGIN stable_id="~/config/vite.config.ts:module:config" type="config" identity="vite-config" parent="~/config/vite.config.ts"]
// CIL[DOC-MACRO purpose="Vite build/dev config for Spine: assembled src root, /api proxy to Netlify dev, manual vendor chunks, @/ @core @custom @shared aliases."]
// CIL[DOC-RESPONSIBILITY responsibility="Point Vite at .assembled/src, wire SPA fallback middleware, public dir, PostCSS (config/postcss.config.cjs), and dev-server fs/proxy settings."]
// CIL[DOC-CONTEXT module="build-config" layer="build" related_files="scripts/assemble-frontend.sh,config/postcss.config.cjs,netlify.toml"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="gotcha" content="css.postcss must reference postcss.config.cjs — the .js filename does not exist on disk."]
// CIL[END stable_id="~/config/vite.config.ts:module:config"]

// Vite config for Spine - assembled src as working root
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback-first',
      configureServer(server) {
        // Runs before Vite's transform middleware. Browser navigation to an
        // app route like /demo would otherwise resolve to demo/index.tsx
        // (directory index) and be served as a JS module instead of the SPA.
        server.middlewares.use((req, _res, next) => {
          const accept = req.headers.accept || ''
          const pathname = (req.url || '').split('?')[0]
          if (
            req.method === 'GET' &&
            accept.includes('text/html') &&
            !/\.[a-zA-Z0-9]+$/.test(pathname)
          ) {
            req.url = '/index.html'
          }
          next()
        })
      },
    },
  ],

  // Root directory for the assembled app
  root: path.resolve(__dirname, '../.assembled/src'),

  // Public directory for static files copied to dist
  // Only spine.config.json is exposed publicly from project root
  publicDir: path.resolve(__dirname, '../public'),
  
  // Build configuration
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          'vendor-markdown': ['marked'],
        },
      },
    },
  },
  
  // Development server
  server: {
    port: 3001,
    host: true,
    allowedHosts: true,
    fs: {
      // Allow serving files from framework, custom, and assembled for app loading
      allow: [
        path.resolve(__dirname, '../.assembled'),
        path.resolve(__dirname, '../.framework'),
        path.resolve(__dirname, '../custom'),
        path.resolve(__dirname, '../node_modules'),
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\//, '/.netlify/functions/'),
      }
    }
  },
  
  // Resolve paths
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../.assembled/src'),
      '@shared': path.resolve(__dirname, '../.framework/functions/_shared'),
      '@core': path.resolve(__dirname, '../.assembled/src'),
      '@custom': path.resolve(__dirname, '../custom/apps')
    }
  },
  
  // Environment variables
  define: {},
  
  // Environment directory (project root for .env files)
  envDir: path.resolve(__dirname, '..'),
  
  // PostCSS configuration (file on disk is postcss.config.cjs — must match exactly)
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs'),
  },
})
