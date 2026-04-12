import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 価値観一覧と dig_sites・元ログを1クエリで取得
    const { data: treasuresWithSites, error } = await supabase
      .from("treasure_collection")
      .select("id, treasure_name, level, description, keywords, fulfillment_state, threat_signal, act_category, dig_sites(id, site, log_id, daily_logs(transcript, emotion_score, created_at))")
      .eq("user_id", user.id)
      .order("level", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      (treasuresWithSites ?? [])
        .map(t => ({ ...t, sites: t.dig_sites ?? [] }))
        .filter(t => t.sites.length > 0)
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "サーバーエラーが発生しました";
    console.error("GET /api/treasures error:", msg);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
