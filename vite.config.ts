import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true, // Automatically open browser when dev server starts
    hmr: {
      overlay: true, // Show errors in browser overlay
    },
    // Force HMR to work better
    watch: {
      usePolling: false, // Set to true if file changes aren't detected
      interval: 100,
    },
  },
  // Clear cache on dev server start
  clearScreen: false,
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'zego-vendor': ['@zegocloud/zego-uikit-prebuilt'],
          'flow-vendor': ['@xyflow/react', 'dagre'],
          'charts-vendor': ['recharts'],
          'pdf-vendor': ['html2pdf.js'],
          'qr-vendor': ['qrcode.react'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
