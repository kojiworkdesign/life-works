import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { relationship, message } = req.body;

  const prompt = `あなたはMBTI心理学の専門家です。人間関係における言動を16タイプそれぞれの視点で本心分析します。

【関係性】${relationship}
【相手の発言・行動】
${message}

この発言・行動をMBTIの16タイプそれぞれがした場合の「本心」を分析してください。

以下のJSON配列のみで返してください（説明・コードブロック不要）：
[{"type":"INTJ","group":"analysts","catch":"その人らしい心の声を一言で","honmei":"本心の解説（2〜3文。そのタイプの心理特性に基づいて的確かつユーモラスに。絵文字1〜2個）"}]

16タイプ全部を含めること。
groupは analysts(INTJ,INTP,ENTJ,ENTP) / diplomats(INFJ,INFP,ENFJ,ENFP) / sentinels(ISTJ,ISFJ,ESTJ,ESFJ) / explorers(ISTP,ISFP,ESTP,ESFP)。
トーン：心理学的に的確だが「これ完全に○○じゃん」と共感してシェアしたくなるユーモアを出す。`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text
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
