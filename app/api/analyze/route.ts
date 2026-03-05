import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { FRAGMENT_ANALYZE_PROMPT } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { week_number } = await req.json();
    if (!week_number) {
      return NextResponse.json({ error: "week_number が必要です" }, { status: 400 });
    }

    // 対象週のログを取得
    const { data: logs, error: logsError } = await supabase
      .from("daily_logs")
      .select("id, transcript, emotion_score, is_analyzed")
      .eq("user_id", user.id)
      .eq("week_number", week_number)
      .order("created_at", { ascending: true });

    if (logsError || !logs || logs.length < 7) {
      return NextResponse.json(
        { error: `7日分のログが必要です（現在 ${logs?.length ?? 0} 日分）` },
        { status: 400 }
      );
    }

    // 分析済みチェック
    if (logs.every(l => l.is_analyzed)) {
      return NextResponse.json({ error: "この週はすでに分析済みです" }, { status: 409 });
    }

    // 既存の花を取得
    const { data: existingFlowers } = await supabase
      .from("flower_collection")
      .select("id, flower_name")
      .eq("user_id", user.id);

    const flowers = existingFlowers ?? [];

    // Gemini に7つのログを一括分析させる
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = FRAGMENT_ANALYZE_PROMPT(
      logs.map((l, i) => ({ index: i, transcript: l.transcript, emotion_score: l.emotion_score })),
      flowers
    );

    const result = await model.generateContent(prompt);
    const { fragments } = JSON.parse(result.response.text()) as {
      fragments: {
        roots: { log_index: number; root: string }[];
        is_new_flower: boolean;
        flower_id?: string;
        flower_name?: string;
        os_description?: string;
        logic_reflection?: string;
        environment_condition?: string;
      }[];
    };

    // 各断片を処理: 新しい花を作成 or 既存の花のレベルを上げる
    const flowerCache: Record<string, string> = {}; // flower_name → id（同回で重複命名を防ぐ）

    for (const fragment of fragments) {
      const rootEntries = (fragment.roots ?? [])
        .map(r => ({ log: logs[r.log_index], root: r.root }))
        .filter(r => r.log != null);
      if (rootEntries.length === 0) continue;

      let flower_id: string;

      if (!fragment.is_new_flower && fragment.flower_id) {
        // 既存の花に紐付け → level++
        flower_id = fragment.flower_id;
        const { data: current } = await supabase
          .from("flower_collection")
          .select("level")
          .eq("id", flower_id)
          .single();
        if (current) {
          await supabase
            .from("flower_collection")
            .update({ level: current.level + 1 })
            .eq("id", flower_id);
        }
      } else {
        // 新しい花を作成（同じ名前が今回すでに作られていたらそちらに紐付け）
        const name = fragment.flower_name ?? "名もなき強み";
        if (flowerCache[name]) {
          flower_id = flowerCache[name];
          const { data: current } = await supabase
            .from("flower_collection")
            .select("level")
            .eq("id", flower_id)
            .single();
          if (current) {
            await supabase
              .from("flower_collection")
              .update({ level: current.level + 1 })
              .eq("id", flower_id);
          }
        } else {
          const { data: newFlower, error: insertError } = await supabase
            .from("flower_collection")
            .insert({
              user_id: user.id,
              flower_name: name,
              os_description: fragment.os_description ?? null,
              logic_reflection: fragment.logic_reflection ?? null,
              environment_condition: fragment.environment_condition ?? null,
              level: 1,
            })
            .select("id")
            .single();
          if (insertError || !newFlower) {
            throw new Error(`花の作成に失敗しました: ${insertError?.message ?? "newFlower is null"}`);
          }
          flower_id = newFlower.id;
          flowerCache[name] = flower_id;
        }
      }

      // root_elements に断片を保存（各ログごとにそのログ固有の root 文を保存）
      for (const { log, root } of rootEntries) {
        await supabase.from("root_elements").insert({
          user_id: user.id,
          flower_id,
          log_id: log.id,
          root,
        });
      }
    }

    // ログを分析済みにマーク
    await supabase
      .from("daily_logs")
      .update({ is_analyzed: true })
      .eq("user_id", user.id)
      .eq("week_number", week_number);

    // 更新後の花一覧を返す
    const { data: updatedFlowers } = await supabase
      .from("flower_collection")
      .select("id, flower_name, level")
      .eq("user_id", user.id)
      .order("level", { ascending: false });

    return NextResponse.json({
      flowers: updatedFlowers ?? [],
      fragment_count: fragments.length,
    });
  } catch (error: any) {
    console.error("Analyze Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
