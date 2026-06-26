import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This aligns with the v4 alpha/beta you have in your package.json
  ],
  server: {
    port: 3000, // Forces the dev server to run on port 3000
    open: true, // Automatically opens the app in your browser on startup
  },
  resolve: {
    alias: {
      '@': '/src', // Allows you to keep using absolute imports like "@/Components/Button"
    },
  },
});