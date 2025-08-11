import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const basePlugins = [
  TanStackRouterVite({ autoCodeSplitting: true }), 
  viteReact(), 
  tailwindcss(),
];

// Add Sentry plugin only if auth token is available
if (process.env.SENTRY_AUTH_TOKEN) {
  basePlugins.push(
    sentryVitePlugin({
      org: "org-name",
      project: "project-name",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: basePlugins,
  build: {
    // Only generate source maps if Sentry is enabled
    sourcemap: !!process.env.SENTRY_AUTH_TOKEN,
    // Optimize bundle size
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'tanstack-vendor': ['@tanstack/react-router', '@tanstack/react-start', '@tanstack/react-store'],
          'ui-vendor': ['lucide-react'],
          'markdown-vendor': ['react-markdown', 'rehype-highlight', 'rehype-raw', 'rehype-sanitize'],
          'anthropic-vendor': ['@anthropic-ai/sdk'],
          // Highlight.js as separate chunk since it's large
          'highlight-vendor': ['highlight.js'],
        },
      },
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000,
    // Optimize for production
    minify: 'esbuild',
    target: 'esnext',
    // Enable gzip compression reporting
    reportCompressedSize: true,
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-start',
      'lucide-react',
    ],
    exclude: [
      // Exclude large libraries from pre-bundling to enable proper chunking
      'highlight.js',
    ],
  },
  // Enable tree shaking
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
