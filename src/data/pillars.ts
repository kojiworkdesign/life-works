/**
 * クラスターマップのピラー。記事のカテゴリ表示と、表紙の色分けに使う。
 * 正本は rakurakufufu/戦略/クラスターマップ.md
 */
export const PILLARS: Record<string, { label: string; tone: string }> = {
  P1: { label: '家計の自動運転', tone: 'green' },
  P2: { label: '夫婦のお金', tone: 'gold' },
  P3: { label: '教育費の準備', tone: 'sky' },
  P4: { label: '投資の置き場', tone: 'plum' },
  P5: { label: '保険と住宅ローン', tone: 'clay' },
  P6: { label: '働き方', tone: 'moss' },
};

export const pillarOf = (id: string) => PILLARS[id] ?? { label: 'お金の話', tone: 'green' };
