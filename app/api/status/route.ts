import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 最初のログから week_number を計算
    const { data: firstLog } = await supabase
      .from("daily_logs")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    const weekNumber = firstLog
      ? Math.floor((Date.now() - new Date(firstLog.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1
      : 1;

    // 今週のログ数
    const { count } = await supabase
      .from("daily_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("week_number", weekNumber);

    // 今週すでに分析済みか
    const { data: analyzed } = await supabase
      .from("seeds_collection")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_number", weekNumber)
      .single();

    return NextResponse.json({
      weekNumber,
      logCount: count ?? 0,
      isDay7Ready: (count ?? 0) >= 7,
      alreadyAnalyzed: !!analyzed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
