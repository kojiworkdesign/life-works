import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, description } = req.body;

  const prompt = `あなたは「令和版脳内ビジュアライザー」AIです。入力された人物の脳内を令和2026年のキーワードで占有率分析します。

名前：${name}
一言：${description}

以下のJSON形式のみで返してください（説明・コードブロック不要）：
{"items":[{"label":"キーワード","percent":数字,"emoji":"絵文字"}],"summary":"要約","comment":"解説コメント"}

ルール：
- itemsは6〜8項目、percentの合計は必ず100
- キーワードはAIが完全自由に発想（令和2026年らしいもの）
- emojiは各キーワードに合った絵文字1個
- summaryは20〜30文字のキャッチーな一言（例：「老後不安と推し活で生きてる」）
- commentは200文字程度。「こんなこと考えてたのw」とバズりそうなユーモアたっぷりトーン。絵文字2〜3個使用
- 名前と一言から連想してユニークでその人らしい結果に`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const data = JSON.parse(text);

    // 合計が100になるよう補正
    const total = data.items.reduce((s, i) => s + i.percent, 0);
    if (total !== 100) {
      data.items[0].percent += (100 - total);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'API error', detail: err.message });
  }
}
