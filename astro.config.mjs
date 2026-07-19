// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://life-works.net',
  integrations: [
    sitemap({
      // noindex のページはサイトマップから外す。
      // （sitemapに載せる＝「インデックスして」なので、noindexと同時に出すと
      //   Search Console でエラーになる）
      // ページ側の noindex を外すときは、ここからも消すこと。
      filter: (page) => !page.includes('/shisan-haibun/'),
    }),
  ],
  // 末尾スラッシュあり（/shisan-haibun/）で既存URLと揃える
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
