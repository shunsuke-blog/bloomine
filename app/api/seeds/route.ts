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

    // 全タネの週番号を一括で取得し、1クエリでログをまとめて取得
    const weekNumbers = (seeds ?? []).map(s => s.week_number);
    const { data: allLogs } = weekNumbers.length > 0
      ? await supabase
          .from("daily_logs")
          .select("id, transcript, emotion_score, created_at, week_number")
          .eq("user_id", user.id)
          .in("week_number", weekNumbers)
          .order("created_at", { ascending: true })
      : { data: [] as { id: string; transcript: string; emotion_score: number | null; created_at: string; week_number: number }[] };

    // week_number でグループ化
    const logsByWeek = new Map<number, typeof allLogs>();
    for (const log of allLogs ?? []) {
      const group = logsByWeek.get(log.week_number) ?? [];
      group.push(log);
      logsByWeek.set(log.week_number, group);
    }

    const seedsWithLogs = (seeds ?? []).map(seed => ({
      ...seed,
      logs: logsByWeek.get(seed.week_number) ?? [],
    }));

    return NextResponse.json(seedsWithLogs);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "サーバーエラーが発生しました";
    console.error("GET /api/seeds error:", msg);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
