// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://life-works.net',
  // noindex のページはサイトマップからも外す（掲載＝「インデックスして」なので矛盾する）。
  // noindex ページを増やしたら、このリストにパスを足すこと。
  integrations: [
    sitemap({
      filter: (page) => {
        const noindex = ['/downloads/'];
        return !noindex.some((p) => page.includes(p));
      },
    }),
  ],
  // 末尾スラッシュあり（/shisan-haibun/）で既存URLと揃える
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
