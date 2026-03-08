import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { calcWeekNumber } from "@/lib/date-utils";
import { TRANSCRIPT_MAX, EMOTION_SCORE_MIN, EMOTION_SCORE_MAX } from "@/lib/constants";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** タイムゾーン対応の週番号を取得 */
async function getWeekNumber(supabase: SupabaseClient, userId: string, timezone: string): Promise<number> {
  const { data } = await supabase
    .from("daily_logs")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!data) return 1;
  return calcWeekNumber(new Date(data.created_at), timezone);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateEmotionScore(score: unknown): number | null {
  if (score === null || score === undefined) return null;
  const n = Number(score);
  if (!Number.isInteger(n) || n < EMOTION_SCORE_MIN || n > EMOTION_SCORE_MAX) return null;
  return n;
}

export async function POST(req: Request) {
  try {
    const { transcript, emotion_score } = await req.json();

    if (!transcript?.trim()) {
      return NextResponse.json({ error: "メッセージが空です" }, { status: 400 });
    }
    if (transcript.length > TRANSCRIPT_MAX) {
      return NextResponse.json({ error: "本文が長すぎます" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("timezone")
      .eq("id", user.id)
      .maybeSingle();
    const timezone = profile?.timezone ?? "Asia/Tokyo";

    const week_number = await getWeekNumber(supabase, user.id, timezone);
    const { data: log } = await supabase
      .from("daily_logs")
      .insert({
        user_id: user.id,
        transcript,
        emotion_score: validateEmotionScore(emotion_score),
        week_number,
      })
      .select("id")
      .single();

    return NextResponse.json({ log_id: log?.id ?? null });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { log_id, transcript, emotion_score } = await req.json();

    if (!log_id || !UUID_RE.test(log_id)) {
      return NextResponse.json({ error: "log_id が不正です" }, { status: 400 });
    }
    if (!transcript?.trim()) {
      return NextResponse.json({ error: "transcript が必要です" }, { status: 400 });
    }
    if (transcript.length > TRANSCRIPT_MAX) {
      return NextResponse.json({ error: "本文が長すぎます" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { error } = await supabase
      .from("daily_logs")
      .update({ transcript, emotion_score: validateEmotionScore(emotion_score) })
      .eq("id", log_id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ log_id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
