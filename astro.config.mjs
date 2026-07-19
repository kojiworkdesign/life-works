// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://life-works.net',
  integrations: [sitemap()],
  // 末尾スラッシュあり（/shisan-haibun/）で既存URLと揃える
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
