import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel'; // ← este es el cambio

export default defineConfig({
  output: 'server',
  adapter: vercel(), // ← no necesita /serverless
  integrations: [react()]
});

