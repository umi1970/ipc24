// @ts-check
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// Note: @astrojs/sitemap is added back in Phase 2 once the blog index page exists
// (single-page builds currently crash the sitemap integration's build:done hook).
export default defineConfig({
  site: 'https://ipc24.de',
  integrations: [mdx(), tailwind({ applyBaseStyles: true })],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
