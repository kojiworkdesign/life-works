/**
 * rakurakufufu/記事/下書き/*.md をブログの記事データへ変換する。
 *
 *   node scripts/import-articles.mjs
 *
 * 原稿（下書き）を正として、ここへコピーする一方通行。
 * 記事を追加するときは ARTICLES に1件足す。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// 原稿は公開時に 下書き/ → 公開済み/ へ移動するので、両方を探す
const searchDirs = [path.join(here, '../../記事/下書き'), path.join(here, '../../記事/公開済み')];
const outDir = path.join(here, '../src/content/blog');

const findDraft = (name) => {
  for (const dir of searchDirs) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`原稿が見つかりません: ${name}\n  探した場所: ${searchDirs.join(', ')}`);
};

const ARTICLES = [
  {
    file: '20260720_夫婦会議はしていません.md',
    slug: 'household-without-meetings',
    date: '2026-07-20',
    description:
      '夫婦の家計は話し合って決めるもの、とよく言われます。我が家は一度も夫婦会議をしていません。合意形成をやめて、片方が設計してもう片方は乗るだけで回す。その全体像と、向き不向きを書きます。',
    targetKeyword: '夫婦 家計 話し合わない 回す',
    pillar: 'P2',
    related: ['quit-allowance-system', 'couple-asset-sharing', 'stay-at-home-wife-budget'],
    cta: 'line',
  },
  {
    file: '20260719_資産をどこまで妻に共有しているか.md',
    slug: 'couple-asset-sharing',
    description:
      '夫婦の資産は全部共有すべきか。我が家が妻に伝えているのは総額と方針だけで、銘柄も積立額も伝えていません。秘密主義ではなく、負担をかけないための線引きとその基準を書きます。',
    targetKeyword: '夫婦 資産額 共有 どこまで',
    pillar: 'P2',
    related: ['household-without-meetings', 'quit-allowance-system', 'stay-at-home-wife-budget'],
    cta: 'line',
  },
  {
    file: '20260719_お小遣い制をやめられる条件.md',
    slug: 'quit-allowance-system',
    description:
      'お小遣い制をやめて共通口座1本にしましたが、支出はほとんど変わりませんでした。やめても破綻しなかった4つの条件と、逆にやめると危ない家庭の見分け方をまとめます。',
    targetKeyword: '夫婦 お小遣い制 やめたい 共通口座',
    pillar: 'P2',
    related: ['household-without-meetings', 'couple-asset-sharing', 'stay-at-home-wife-budget'],
    cta: 'line',
  },
  {
    file: '20260719_専業主婦のままで大丈夫かに試算で答えた.md',
    slug: 'stay-at-home-wife-budget',
    description:
      '「このまま専業主婦で大丈夫？」と妻に聞かれ、感覚ではなく試算で答えました。一馬力で家計が回るかを判定する3ステップと、我が家の結論、そしてその条件を書きます。',
    targetKeyword: '妻 専業主婦 家計 大丈夫か 不安',
    pillar: 'P2',
    related: ['household-without-meetings', 'couple-asset-sharing', 'quit-allowance-system'],
    cta: 'tool',
    ctaTool: '/shisan-haibun/',
  },
];

const esc = (s) => `"${s.replace(/"/g, '\\"')}"`;

fs.mkdirSync(outDir, { recursive: true });

for (const a of ARTICLES) {
  let md = fs.readFileSync(findDraft(a.file), 'utf8');

  // 1. 先頭のHTMLコメント（メタ情報メモ）を除去
  md = md.replace(/^<!--[\s\S]*?-->\s*/, '');

  // 2. H1をタイトルとして取り出し、本文からは消す（レイアウト側でH1を出すため）
  const h1 = md.match(/^#\s+(.+)$/m);
  const title = h1 ? h1[1].trim() : a.slug;
  md = md.replace(/^#\s+.+$\n*/m, '');

  // 3. 末尾のハッシュタグ行を除去（noteの慣習でブログには不要）
  md = md.replace(/^#[^\s#]+(?:\s+#[^\s#]+)*\s*$/gm, '');

  // 4. CTAの生リンク行を除去（ボタンはレイアウト側のコンポーネントが出す）
  md = md.replace(/^[▶👇].*\n+https?:\/\/\S+\s*$/gm, '');

  // 5. 余分な空行を詰める
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  const fm = [
    '---',
    `title: ${esc(title)}`,
    `description: ${esc(a.description)}`,
    `publishedAt: ${a.date ?? '2026-07-19'}`,
    `targetKeyword: ${esc(a.targetKeyword)}`,
    `pillar: ${esc(a.pillar)}`,
    `related: [${a.related.map((r) => esc(r)).join(', ')}]`,
    `cta: ${esc(a.cta)}`,
    ...(a.ctaTool ? [`ctaTool: ${esc(a.ctaTool)}`] : []),
    '---',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(outDir, `${a.slug}.md`), fm + md + '\n', 'utf8');
  console.log(`${a.slug.padEnd(26)} ${title}`);
}

console.log(`\n${ARTICLES.length}本を ${path.relative(process.cwd(), outDir)} へ書き出しました`);
