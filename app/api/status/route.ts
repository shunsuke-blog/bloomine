import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { calcWeekNumber, appDateStr } from "@/lib/date-utils";
import { getAnalysisStatus } from "@/lib/subscription";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // タイムゾーンのズレを考慮して過去48時間分を取得し、プロフィール等と並列実行
    const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const [profileResult, firstLogResult, analysisStatus, recentLogsResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("timezone, display_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("daily_logs")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single(),
      getAnalysisStatus(supabase, user.id),
      supabase
        .from("daily_logs")
        .select("id, created_at, transcript")
        .eq("user_id", user.id)
        .gte("created_at", since48h)
        .order("created_at", { ascending: false }),
    ]);

    const timezone = profileResult.data?.timezone ?? "Asia/Tokyo";
    const displayName = profileResult.data?.display_name ?? "";
    const weekNumber = firstLogResult.data
      ? calcWeekNumber(new Date(firstLogResult.data.created_at), timezone)
      : 1;

    const todayStr = appDateStr(new Date(), timezone);
    const todayLogsData = recentLogsResult.data;

    const todayLogsFiltered = (todayLogsData ?? []).filter(
      l => appDateStr(new Date(l.created_at), timezone) === todayStr
    );
    const todayLog = todayLogsFiltered[0];

    return NextResponse.json({
      weekNumber,
      timezone,
      display_name: displayName,
      today_log_id: todayLog?.id ?? null,
      today_log_transcript: todayLog?.transcript ?? null,
      today_log_count: todayLogsFiltered.length,
      // 分析ステータス
      unanalyzedCount: analysisStatus.unanalyzedCount,
      canAnalyze: analysisStatus.canAnalyze,
      freeAnalysesLeft: analysisStatus.freeAnalysesLeft,
      isSubscribed: analysisStatus.isSubscribed,
      isAdmin: analysisStatus.isAdmin,
      totalAnalysesCount: analysisStatus.totalAnalysesCount,
      cycleTarget: analysisStatus.cycleTarget,
      logsUntilNextAnalysis: analysisStatus.logsUntilNextAnalysis,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
