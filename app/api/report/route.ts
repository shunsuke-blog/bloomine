import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { hasAccessWithFreeTrial } from "@/lib/subscription";
import { VIA_CATEGORIES, type ViaCategory } from "@/lib/categories";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin, subscription_status, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!hasAccessWithFreeTrial(profile)) {
      return NextResponse.json({ error: "アクセス権がありません" }, { status: 403 });
    }

    const [{ data: treasuresRaw }, { data: seeds }, { data: flowers }] = await Promise.all([
      supabase
        .from("treasure_collection")
        .select("id, treasure_name, level, description, keywords, fulfillment_state, threat_signal, act_category, dig_sites(id, site, log_id, daily_logs(transcript, emotion_score, created_at))")
        .eq("user_id", user.id)
        .order("level", { ascending: false })
        .limit(5),
      supabase
        .from("seeds_collection")
        .select("id, week_number, seed_name, os_description, logic_reflection, environment_condition, created_at")
        .eq("user_id", user.id)
        .order("week_number", { ascending: false }),
      supabase
        .from("flower_collection")
        .select("via_category, level")
        .eq("user_id", user.id)
        .not("via_category", "is", null),
    ]);

    // VIA 6カテゴリ別にレベルを合計
    const radarData = Object.fromEntries(VIA_CATEGORIES.map(c => [c, 0])) as Record<ViaCategory, number>;
    for (const f of flowers ?? []) {
      const cat = f.via_category as ViaCategory;
      if (cat in radarData) radarData[cat] += f.level;
    }

    const treasures = (treasuresRaw ?? []).map(t => ({ ...t, sites: t.dig_sites ?? [] }));

    return NextResponse.json({
      pyramidValues: treasures,
      weeklySeeds: seeds ?? [],
      radarData,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "サーバーエラーが発生しました";
    console.error("GET /api/report error:", msg);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
