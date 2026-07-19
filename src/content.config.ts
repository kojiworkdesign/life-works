import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * ブログ記事。原稿は rakurakufufu/記事/下書き/ で書き、公開時にここへコピーする。
 * 項目を増やすと全記事の修正が必要になるので、増やす前に本当に要るか考える。
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    /** <title>・OGP・記事のH1に使われる */
    title: z.string(),
    /** 検索結果に出る説明文。120字前後 */
    description: z.string(),
    publishedAt: z.coerce.date(),
    /** 内容を直したときだけ設定する（Googleは鮮度を見る） */
    updatedAt: z.coerce.date().optional(),
    /** 狙っているロングテールKW。分析用で、表示はしない */
    targetKeyword: z.string(),
    /** 所属ピラー（P1〜P6）。クラスターマップと対応 */
    pillar: z.string(),
    /** 関連記事のslug。記事下に出す */
    related: z.array(z.string()).default([]),
    /**
     * 記事末尾のCTA。'line' はLINE登録のみ、'tool' は無料ツール→LINEの2段。
     * 本文にCTAの導入文を書き、実際のボタンはレイアウト側が出す（文言の変更が1箇所で済む）
     */
    cta: z.enum(['line', 'tool']).default('line'),
    /** cta:'tool' のときの誘導先 */
    ctaTool: z.string().default('/shisan-haibun/'),
    /** 未指定ならサイト共通のOGP画像を使う */
    ogImage: z.string().optional(),
    /** true の間はビルドされない */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
