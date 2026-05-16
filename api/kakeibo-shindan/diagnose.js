import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers, basicInfo } = req.body;

  const answersText = answers
    .map(a => `${a.question} → ${a.answer}`)
    .join('\n');

  const basicInfoText = basicInfo
    ? `【基本情報】\n立場：${basicInfo.role}\n年齢：${basicInfo.age}歳\n\n`
    : '';

  const prompt = `あなたは家計・夫婦のお金をテーマにした診断コンテンツのキャラクター命名の専門家です。

以下の設問への回答をもとに、この人の「家計タイプ名」を作ってください。

【タイプ名の条件】
- 思わずXでシェアしたくなるユニークさ
- 読んだ瞬間に「わかる！」「うちだ！」となる共感
- ネガティブすぎず、クスッとできるトーン
- 10〜16文字程度
- 毎回必ず違う表現を使うこと（ありきたりな言葉は避ける）
- 家計・夫婦・お金・投資に関連した言葉を使う

【出力形式】必ずJSONのみを返してください。前後に説明文やコードブロック記号は不要です。
{
  "type_name": "タイプ名",
  "subtitle": "サブタイトル（20文字以内）",
  "description": "あなたの家計グセと特徴（2〜3文、やわらかい口語で）",
  "advice": "らくらく夫婦からのひとこと（1文）"
}

${basicInfoText}【回答内容】
${answersText}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    let text = message.content[0].text.trim();
    // コードブロックで囲まれていた場合に除去
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const result = JSON.parse(text);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'API error', detail: err.message });
  }
}
