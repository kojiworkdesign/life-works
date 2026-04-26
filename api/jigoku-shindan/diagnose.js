import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers, hellPercent } = req.body;

  const prompt = `あなたはユーモアたっぷりの「職場地獄度診断士」です。
以下のアンケート結果をもとに、診断コメントを日本語で書いてください。

【回答内容】
- 週の残業時間：${answers.q1}
- 上司のタイプ：${answers.q2}
- 有給の取りやすさ：${answers.q3}
- 謎ルールの有無：${answers.q4}
- 「うちだけ？」感：${answers.q5}
- 地獄度スコア：${hellPercent}%

【ルール】
- 3〜4文で書く
- ユーモアと共感を込めて、でも少し毒を入れる
- 「あるある」感を大切に
- シェアしたくなるような締めにする
- 絵文字を2〜3個使う
- 診断名（${hellPercent <= 40 ? 'まだ救いあり' : hellPercent <= 70 ? '修行が必要' : '即転職を推奨'}レベル）に合ったトーンで`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const diagnosis = message.content[0].text;
    return res.status(200).json({ diagnosis });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'API error' });
  }
}
