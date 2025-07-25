import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // El adaptador de Vercel para Server-Side Rendering
  adapter: vercel(),
  integrations: [react()]
});
