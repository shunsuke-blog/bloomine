import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GUIDE_SYSTEM_PROMPT } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

async function getWeekNumber(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<number> {
  const { data } = await supabase
    .from("daily_logs")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!data) return 1;

  const diffDays = Math.floor(
    (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.floor(diffDays / 7) + 1;
}

export async function POST(req: Request) {
  try {
    const { transcript, emotion_score } = await req.json();

    if (!transcript?.trim()) {
      return NextResponse.json({ error: "メッセージが空です" }, { status: 400 });
    }

    // Gemini で AI 返答を生成
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: GUIDE_SYSTEM_PROMPT,
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: transcript }] }],
    });
    const ai_response = result.response.text();

    // 認証済みの場合は DB に保存
    let log_id: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const week_number = await getWeekNumber(supabase, user.id);
        const { data: log } = await supabase
          .from("daily_logs")
          .insert({
            user_id: user.id,
            transcript,
            emotion_score: emotion_score ?? null,
            ai_response,
            week_number,
          })
          .select("id")
          .single();
        log_id = log?.id ?? null;
      }
    } catch (dbError) {
      console.error("DB save skipped:", dbError);
    }

    return NextResponse.json({ text: ai_response, log_id });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
