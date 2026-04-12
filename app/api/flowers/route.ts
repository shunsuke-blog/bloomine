import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 花一覧と root_elements・元ログを1クエリで取得
    const { data: flowersWithRoots, error: rootError } = await supabase
      .from("flower_collection")
      .select("id, flower_name, level, os_description, logic_reflection, environment_condition, via_category, root_elements(id, root, log_id, daily_logs(transcript, emotion_score, created_at))")
      .eq("user_id", user.id)
      .order("level", { ascending: false });

    if (rootError) throw rootError;

    return NextResponse.json(
      (flowersWithRoots ?? [])
        .map(f => ({ ...f, roots: f.root_elements ?? [] }))
        .filter(f => f.roots.length > 0)
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "サーバーエラーが発生しました";
    console.error("GET /api/flowers error:", msg);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
