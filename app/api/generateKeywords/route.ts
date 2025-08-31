// app/api/generateKeywords/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const prompt = `
    以下の条件に従って、カラオケゲーム用のお題を60個生成してください。

    【条件】
    - 各お題はオブジェクト形式で出力してください（例：{ "id": 1, "level": 1, "word": "愛" }）
    - 難易度1（歌のテーマとしてありがちな1単語。感情や人間関係や生活・人生、季節に関するワードなど）：21個
    - 難易度2（歌のテーマとしてはやや珍しいが、連想可能な1単語。難易度1以外のあらゆる名詞、動詞、形容詞、副詞などのワード）：21個
    - 難易度3（詩的・抽象的な短いフレーズ。または2単語からなる複合語など）：18個
    - 結果は必ず **有効な JSON 配列形式** で出力してください（各要素はオブジェクト）
    - 出力は純粋な JSON 配列 のみ（前後の説明文や補足なし）
    - オブジェクトの各プロパティ名・文字列はすべて "ダブルクォート" で囲んでください
    - 各お題は次の形式のオブジェクト：{ "id": 1, "level": 1, "word": "愛" }
    例（出力の構造）：
    [
      { "id": 1, "level": 1, "word": "愛" },
      ...
    ]
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'あなたはカラオケゲームのお題生成AIです。' },
        { role: 'user', content: prompt },
      ],
    });

    let raw = completion.choices[0]?.message?.content || '';
    console.log(raw);
    // ```json や ``` を除去（あれば）
    raw = raw.replace(/```json|```/g, '').trim();

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('JSONパース失敗', e);
      return NextResponse.json({ error: 'JSONパース失敗' }, { status: 500 });
    }
    return NextResponse.json({ result: parsed });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
