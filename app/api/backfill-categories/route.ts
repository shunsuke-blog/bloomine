import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { VIA_CATEGORIES, ACT_CATEGORIES } from "@/lib/categories";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // via_category / act_category が null のデータを取得（並列）
    const [{ data: flowers }, { data: treasures }] = await Promise.all([
      supabase
        .from("flower_collection")
        .select("id, flower_name, os_description")
        .eq("user_id", user.id)
        .is("via_category", null),
      supabase
        .from("treasure_collection")
        .select("id, treasure_name, description")
        .eq("user_id", user.id)
        .is("act_category", null),
    ]);

    const flowerList = flowers ?? [];
    const treasureList = treasures ?? [];

    if (flowerList.length === 0 && treasureList.length === 0) {
      return NextResponse.json({ message: "補完対象なし", flowers: 0, treasures: 0 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `以下の強みの花と価値観の宝物を、指定のカテゴリに分類してください。
名称と説明文から最もふさわしいカテゴリを1つ選んでください。

## VIA カテゴリ（花の強み分類）
- "wisdom"        … 知恵と知識（好奇心・学習欲・創造性・洞察力・大局観）
- "courage"       … 勇気（誠実さ・熱意・忍耐力・勇敢さ）
- "humanity"      … 人間性（思いやり・愛情・社会的知性）
- "justice"       … 公正さ（チームワーク・公平さ・リーダーシップ）
- "temperance"    … 節制（謙虚さ・慎重さ・自己調整力）
- "transcendence" … 超越性（感謝・希望・ユーモア・審美眼・スピリチュアリティ）

## ACT カテゴリ（価値観の領域分類）
- "family"                … 家族
- "intimate_relationship" … 親密な関係
- "friendship"            … 友人・社会関係
- "spirituality"          … スピリチュアリティ・意味・自然
- "work"                  … 仕事・キャリア
- "learning"              … 学習・成長・創造
- "leisure"               … 余暇・趣味・楽しみ
- "citizenship"           … 市民性・社会貢献・公正
- "health"                … 身体・健康・自己ケア
- "parenting"             … 子育て・愛情・ケア

## 分類対象

### 花（強み）
${JSON.stringify(flowerList.map((f) => ({ id: f.id, name: f.flower_name, description: f.os_description })))}

### 価値観（宝物）
${JSON.stringify(treasureList.map((t) => ({ id: t.id, name: t.treasure_name, description: t.description })))}

## 出力形式（必ずこのJSONのみを返すこと）
{
  "flowers": [{ "id": "uuid", "via_category": "wisdom" }],
  "treasures": [{ "id": "uuid", "act_category": "family" }]
}`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text()) as {
      flowers: { id: string; via_category: string }[];
      treasures: { id: string; act_category: string }[];
    };

    // バリデーション用型ガード
    const validViaSet = new Set<string>(VIA_CATEGORIES);
    const validActSet = new Set<string>(ACT_CATEGORIES);
    const isValidVia = (v: string) => validViaSet.has(v);
    const isValidAct = (v: string) => validActSet.has(v);

    // DB更新（並列・user_id 絞り込みで安全に）
    await Promise.all([
      ...(parsed.flowers ?? [])
        .filter((f) => f.id && isValidVia(f.via_category))
        .map(({ id, via_category }) =>
          supabase
            .from("flower_collection")
            .update({ via_category })
            .eq("id", id)
            .eq("user_id", user.id)
        ),
      ...(parsed.treasures ?? [])
        .filter((t) => t.id && isValidAct(t.act_category))
        .map(({ id, act_category }) =>
          supabase
            .from("treasure_collection")
            .update({ act_category })
            .eq("id", id)
            .eq("user_id", user.id)
        ),
    ]);

    return NextResponse.json({
      message: "補完完了",
      flowers: (parsed.flowers ?? []).filter((f) => isValidVia(f.via_category)).length,
      treasures: (parsed.treasures ?? []).filter((t) => isValidAct(t.act_category)).length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Backfill error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
