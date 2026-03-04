import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ANALYZE_SYSTEM_PROMPT } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { week_number } = await req.json();
    if (!week_number) {
      return NextResponse.json({ error: "week_number が必要です" }, { status: 400 });
    }

    // 一期一会チェック：すでに分析済みなら拒否
    const { data: existing } = await supabase
      .from("seeds_collection")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_number", week_number)
      .single();

    if (existing) {
      return NextResponse.json({ error: "この週はすでに分析済みです" }, { status: 409 });
    }

    // 対象週の全ログを取得
    const { data: logs, error: logsError } = await supabase
      .from("daily_logs")
      .select("transcript, emotion_score, created_at")
      .eq("user_id", user.id)
      .eq("week_number", week_number)
      .order("created_at", { ascending: true });

    if (logsError || !logs || logs.length < 7) {
      return NextResponse.json(
        { error: `7日分のログが必要です（現在 ${logs?.length ?? 0} 日分）` },
        { status: 400 }
      );
    }

    // 7日分のログを Gemini に渡す文章を構築
    const logsText = logs
      .map((log, i) => {
        const score = log.emotion_score ?? "未回答";
        return `Day${i + 1}（感情スコア: ${score}）\n${log.transcript}`;
      })
      .join("\n\n---\n\n");

    const prompt = `以下は、ある人の7日間の夜の独り言です。この人の「OS（性質）」を分析し、指定のJSON形式で返してください。\n\n${logsText}`;

    // Gemini で分析
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: ANALYZE_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());

    const { seed_name, os_description, logic_reflection, environment_condition } = json;

    // seeds_collection に保存
    const { data: seed, error: insertError } = await supabase
      .from("seeds_collection")
      .insert({
        user_id: user.id,
        week_number,
        seed_name,
        os_description,
        logic_reflection,
        environment_condition,
      })
      .select()
      .single();

    if (insertError) {
      console.error("seeds_collection insert error:", insertError);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    // 使用済みフラグを更新
    await supabase
      .from("daily_logs")
      .update({ is_analyzed: true })
      .eq("user_id", user.id)
      .eq("week_number", week_number);

    return NextResponse.json(seed);
  } catch (error: any) {
    console.error("Analyze Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
