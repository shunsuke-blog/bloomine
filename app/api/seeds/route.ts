import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // タネ一覧を取得（新しい週順）
    const { data: seeds, error } = await supabase
      .from("seeds_collection")
      .select("*")
      .eq("user_id", user.id)
      .order("week_number", { ascending: false });

    if (error) throw error;

    // 各タネに対応する週のログを取得
    const seedsWithLogs = await Promise.all(
      (seeds ?? []).map(async (seed) => {
        const { data: logs } = await supabase
          .from("daily_logs")
          .select("id, transcript, emotion_score, created_at")
          .eq("user_id", user.id)
          .eq("week_number", seed.week_number)
          .order("created_at", { ascending: true });

        return { ...seed, logs: logs ?? [] };
      })
    );

    return NextResponse.json(seedsWithLogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
