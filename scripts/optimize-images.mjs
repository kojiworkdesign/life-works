/**
 * public/images 配下のPNGを用途に応じてリサイズ・再圧縮する（上書き）。
 * 参照パスは変えないので、HTML側の修正は不要。
 *
 *   node scripts/optimize-images.mjs
 *
 * 記事用の画像を追加したときも、これを流してから公開する。
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/images');

// 用途ごとの最大幅。カード画像は表示枠が304pxなのでRetina考慮でも900pxで足りる
const maxWidth = (name) => {
  if (name.startsWith('ogp')) return 1200; // OGPの推奨は1200x630
  if (name === 'icon.png') return 512;
  if (name.includes('banner')) return 1000;
  return 900;
};

let before = 0;
let after = 0;
const rows = [];

for (const name of fs.readdirSync(dir).filter((f) => /\.png$/i.test(f))) {
  const file = path.join(dir, name);
  const orig = fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  const w = Math.min(maxWidth(name), meta.width);

  const buf = await sharp(file)
    .resize({ width: w, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 82, effort: 10 })
    .toBuffer();

  // 元より大きくなる場合は書き換えない
  if (buf.length < orig) fs.writeFileSync(file, buf);

  const now = fs.statSync(file).size;
  before += orig;
  after += now;
  rows.push({
    name,
    元: `${(orig / 1024).toFixed(0)}KB`,
    後: `${(now / 1024).toFixed(0)}KB`,
    削減: `${(100 - (now / orig) * 100).toFixed(0)}%`,
    幅: `${meta.width}→${w}`,
  });
}

console.table(rows);
console.log(
  `合計: ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB  (${(100 - (after / before) * 100).toFixed(0)}% 削減)`
);
