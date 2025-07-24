// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
// https://astro.build/config
export default defineConfig({
integrations: [react()],
  vite: {
    build: {
      assetsInlineLimit: 0 // 👈 fuerza que las imágenes se generen como archivos
    }
  }
});

