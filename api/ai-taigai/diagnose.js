import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { job, tasks } = req.body;

  const prompt = `あなたはAI代替リスクの専門家です。以下の職種・業務内容を分析し、AIに代替されるまでの日数を診断してください。

職種：${job}
主な業務：${tasks}

以下のJSON形式のみで回答してください（説明・コードブロック不要）：
{"days":数字,"comment":"3〜4文。ユーモアと少しの毒を交えて。具体的な業務に触れながら。絵文字2〜3個","safe_skills":["スキル1","スキル2","スキル3"],"level":"levelの値"}

daysとlevelの基準：
- critical: 180〜499日（単純作業・データ入力・定型業務が中心）
- danger: 500〜999日（ルーティン業務が多い）
- warning: 1000〜2999日（判断・調整・対人業務がある）
- safe: 3000〜5475日（高度な創造・戦略・複雑な対人業務）`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'API error' });
  }
}
