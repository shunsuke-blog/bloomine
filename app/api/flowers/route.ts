import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 花一覧をレベル降順で取得
    const { data: flowers, error } = await supabase
      .from("flower_collection")
      .select("id, flower_name, level, os_description, logic_reflection, environment_condition, via_category")
      .eq("user_id", user.id)
      .order("level", { ascending: false });

    if (error) throw error;

    // 各花の root_elements（断片）とその元ログを取得
    const flowersWithRoots = await Promise.all(
      (flowers ?? []).map(async (flower) => {
        const { data: roots } = await supabase
          .from("root_elements")
          .select("id, root, log_id, daily_logs(transcript, emotion_score, created_at)")
          .eq("flower_id", flower.id)
          .order("created_at", { ascending: true });

        return { ...flower, roots: roots ?? [] };
      })
    );

    return NextResponse.json(flowersWithRoots.filter((f) => f.roots.length > 0));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
