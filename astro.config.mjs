// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://life-works.net',
  // noindex のページを作ったときは sitemap({ filter: ... }) で除外すること。
  // sitemap掲載＝「インデックスして」なので、noindexと同時に出すと矛盾になる。
  integrations: [sitemap()],
  // 末尾スラッシュあり（/shisan-haibun/）で既存URLと揃える
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
