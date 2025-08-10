import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: '0.0.0.0',
    allowedHosts: ['nzooimmo.com', 'www.nzooimmo.com'],
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: '0.0.0.0',
  },
  base: '/',  // à ajouter si ce n’est pas déjà fait
});


