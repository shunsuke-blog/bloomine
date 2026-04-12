import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GUIDE_SYSTEM_PROMPT } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "メッセージが空です" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: GUIDE_SYSTEM_PROMPT(),
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    return NextResponse.json({ text: result.response.text() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "サーバーエラーが発生しました";
    console.error("POST /api/chat error:", msg);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
