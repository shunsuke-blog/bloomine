import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { FRAGMENT_ANALYZE_PROMPT, VALUE_ANALYZE_PROMPT, ANALYZE_SYSTEM_PROMPT } from "@/lib/prompts";
import { PROMPT_MAP } from "@/lib/messages";
import { getAnalysisStatus } from "@/lib/subscription";
import { RATE_LIMIT_MS } from "@/lib/constants";
import { type FlowerFragment, type TreasureFragment } from "@/lib/analysis-types";
import { calcLevelGain } from "@/lib/level-utils";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 分析可否チェック
    const status = await getAnalysisStatus(supabase, user.id);
    if (!status.canAnalyze) {
      if (status.freeAnalysesLeft === 0 && !status.isSubscribed) {
        return NextResponse.json({ error: "subscription_required" }, { status: 402 });
      }
      return NextResponse.json(
        { error: `あと ${status.logsUntilNextAnalysis} 件のログで分析できます` },
        { status: 400 }
      );
    }

    // レート制限: 直近の分析完了から24時間以内は拒否
    const { data: recentAnalyzed } = await supabase
      .from("daily_logs")
      .select("updated_at")
      .eq("user_id", user.id)
      .eq("is_analyzed", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentAnalyzed?.updated_at) {
      const elapsed = Date.now() - new Date(recentAnalyzed.updated_at).getTime();
      if (elapsed < RATE_LIMIT_MS) {
        const waitMin = Math.ceil((RATE_LIMIT_MS - elapsed) / 60_000);
        return NextResponse.json(
          { error: `分析は24時間に1回です。あと約${waitMin}分後にお試しください。` },
          { status: 429 }
        );
      }
    }

    // 未分析ログを取得（前回分析以降の全件）
    const { data: logs, error: logsError } = await supabase
      .from("daily_logs")
      .select("id, transcript, emotion_score, is_analyzed, week_number, prompt_id")
      .eq("user_id", user.id)
      .eq("is_analyzed", false)
      .order("created_at", { ascending: true });

    if (logsError || !logs || logs.length === 0) {
      return NextResponse.json({ error: "分析対象のログがありません" }, { status: 400 });
    }

    const logInputs = logs.map((l, i) => {
      const prompt = l.prompt_id ? PROMPT_MAP.get(l.prompt_id) : null;
      return {
        index: i,
        transcript: l.transcript,
        emotion_score: l.emotion_score,
        prompt_text: prompt?.text ?? null,
        prompt_category: prompt?.category ?? null,
      };
    });

    // 既存の花・価値観を取得（並列）
    const [{ data: existingFlowers }, { data: existingTreasures }] = await Promise.all([
      supabase.from("flower_collection").select("id, flower_name").eq("user_id", user.id),
      supabase.from("treasure_collection").select("id, treasure_name").eq("user_id", user.id),
    ]);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 強み分析・価値観分析・OS命名を並列実行
    const logText = logInputs.map((l) => `Day${l.index + 1}（感情スコア: ${l.emotion_score ?? "未回答"}）\n${l.transcript}`).join("\n\n---\n\n");
    const [flowerResult, treasureResult, seedResult] = await Promise.all([
      model.generateContent(FRAGMENT_ANALYZE_PROMPT(logInputs, existingFlowers ?? [])),
      model.generateContent(VALUE_ANALYZE_PROMPT(logInputs, existingTreasures ?? [])),
      model.generateContent({ contents: [{ role: "user", parts: [{ text: logText }] }], systemInstruction: ANALYZE_SYSTEM_PROMPT }),
    ]);

    // ── 強みの処理 ────────────────────────────────────────────────────────────
    let flowerFragments: FlowerFragment[];
    try {
      const parsed = JSON.parse(flowerResult.response.text()) as { fragments: FlowerFragment[] };
      flowerFragments = parsed.fragments ?? [];
    } catch {
      console.error("強み分析JSONパース失敗:", flowerResult.response.text());
      return NextResponse.json({ error: "強み分析結果の解析に失敗しました。再度お試しください。" }, { status: 422 });
    }

    // 既存花のレベルを一括取得
    const existingFlowerIds = flowerFragments
      .filter(f => !f.is_new_flower && f.flower_id)
      .map(f => f.flower_id!);
    const { data: existingFlowerLevels } = existingFlowerIds.length > 0
      ? await supabase.from("flower_collection").select("id, level").in("id", existingFlowerIds)
      : { data: [] as { id: string; level: number }[] };
    const flowerLevelMap = new Map(existingFlowerLevels?.map(f => [f.id, f.level]) ?? []);

    // Pass 1: 差分を集計（DB呼び出しなし）
    type RootEntry = { log: typeof logs[0]; root: string };
    type ExistingFlowerAccum = { totalGain: number; via_category?: string; roots: RootEntry[] };
    type NewFlowerAccum = { fragment: FlowerFragment; totalGain: number; roots: RootEntry[] };

    const existingFlowerAccum = new Map<string, ExistingFlowerAccum>();
    const newFlowerAccum = new Map<string, NewFlowerAccum>();
    const newFlowerIdSet = new Set<string>();
    const analyzedFlowerIdSet = new Set<string>();

    for (const fragment of flowerFragments) {
      const rootEntries = (fragment.roots ?? [])
        .map(r => ({ log: logs[r.log_index], root: r.root }))
        .filter(r => r.log != null);
      if (rootEntries.length === 0) continue;

      const gain = calcLevelGain(rootEntries.length);

      if (!fragment.is_new_flower && fragment.flower_id) {
        const acc = existingFlowerAccum.get(fragment.flower_id);
        existingFlowerAccum.set(fragment.flower_id, {
          totalGain: (acc?.totalGain ?? 0) + gain,
          via_category: fragment.via_category ?? acc?.via_category,
          roots: [...(acc?.roots ?? []), ...rootEntries],
        });
        analyzedFlowerIdSet.add(fragment.flower_id);
      } else {
        const name = fragment.flower_name ?? "名もなき強み";
        const acc = newFlowerAccum.get(name);
        newFlowerAccum.set(name, {
          fragment: acc?.fragment ?? fragment,
          totalGain: (acc?.totalGain ?? 0) + gain,
          roots: [...(acc?.roots ?? []), ...rootEntries],
        });
      }
    }

    // Pass 2a: 既存花を並列UPDATE
    await Promise.all(
      [...existingFlowerAccum.entries()].map(([flower_id, { totalGain, via_category }]) =>
        supabase.from("flower_collection").update({
          level: (flowerLevelMap.get(flower_id) ?? 1) + totalGain,
          ...(via_category ? { via_category } : {}),
        }).eq("id", flower_id)
      )
    );

    // Pass 2b: 新規花を並列INSERT
    const newFlowerEntries = [...newFlowerAccum.entries()];
    const insertedFlowers = await Promise.all(
      newFlowerEntries.map(([, { fragment, totalGain }]) =>
        supabase.from("flower_collection").insert({
          user_id: user.id,
          flower_name: fragment.flower_name ?? "名もなき強み",
          os_description: fragment.os_description ?? null,
          logic_reflection: fragment.logic_reflection ?? null,
          environment_condition: fragment.environment_condition ?? null,
          via_category: fragment.via_category ?? null,
          level: totalGain,
        }).select("id").single()
      )
    );

    // root_elements を一括INSERT
    const allRootInserts: { user_id: string; flower_id: string; log_id: string; root: string }[] = [];

    for (const [flower_id, { roots }] of existingFlowerAccum) {
      for (const { log, root } of roots) {
        allRootInserts.push({ user_id: user.id, flower_id, log_id: log.id, root });
      }
    }
    for (let i = 0; i < newFlowerEntries.length; i++) {
      const { data: newFlower, error: insertError } = insertedFlowers[i];
      if (insertError || !newFlower) {
        throw new Error(`花の作成に失敗しました: ${insertError?.message ?? "newFlower is null"}`);
      }
      newFlowerIdSet.add(newFlower.id);
      analyzedFlowerIdSet.add(newFlower.id);
      for (const { log, root } of newFlowerEntries[i][1].roots) {
        allRootInserts.push({ user_id: user.id, flower_id: newFlower.id, log_id: log.id, root });
      }
    }

    if (allRootInserts.length > 0) {
      const { error: rootInsertError } = await supabase.from("root_elements").insert(allRootInserts);
      if (rootInsertError) {
        throw new Error(`根拠エピソードの保存に失敗しました: ${rootInsertError.message}`);
      }
    }

    // ── 価値観の処理 ──────────────────────────────────────────────────────────
    let treasureFragments: TreasureFragment[];
    try {
      const parsed = JSON.parse(treasureResult.response.text()) as { fragments: TreasureFragment[] };
      treasureFragments = parsed.fragments ?? [];
    } catch {
      console.error("価値観分析JSONパース失敗:", treasureResult.response.text());
      return NextResponse.json({ error: "価値観分析結果の解析に失敗しました。再度お試しください。" }, { status: 422 });
    }

    // 既存価値観のレベルを一括取得
    const existingTreasureIds = treasureFragments
      .filter(f => !f.is_new_treasure && f.treasure_id)
      .map(f => f.treasure_id!);
    const { data: existingTreasureLevels } = existingTreasureIds.length > 0
      ? await supabase.from("treasure_collection").select("id, level").in("id", existingTreasureIds)
      : { data: [] as { id: string; level: number }[] };
    const treasureLevelMap = new Map(existingTreasureLevels?.map(t => [t.id, t.level]) ?? []);

    // Pass 1: 差分を集計（DB呼び出しなし）
    type SiteEntry = { log: typeof logs[0]; site: string };
    type ExistingTreasureAccum = { totalGain: number; act_category?: string; sites: SiteEntry[] };
    type NewTreasureAccum = { fragment: TreasureFragment; totalGain: number; sites: SiteEntry[] };

    const existingTreasureAccum = new Map<string, ExistingTreasureAccum>();
    const newTreasureAccum = new Map<string, NewTreasureAccum>();
    const newTreasureIdSet = new Set<string>();
    const analyzedTreasureIdSet = new Set<string>();

    for (const fragment of treasureFragments) {
      const siteEntries = (fragment.sites ?? [])
        .map(s => ({ log: logs[s.log_index], site: s.site }))
        .filter(s => s.log != null);
      if (siteEntries.length === 0) continue;

      const gain = calcLevelGain(siteEntries.length);

      if (!fragment.is_new_treasure && fragment.treasure_id) {
        const acc = existingTreasureAccum.get(fragment.treasure_id);
        existingTreasureAccum.set(fragment.treasure_id, {
          totalGain: (acc?.totalGain ?? 0) + gain,
          act_category: fragment.act_category ?? acc?.act_category,
          sites: [...(acc?.sites ?? []), ...siteEntries],
        });
        analyzedTreasureIdSet.add(fragment.treasure_id);
      } else {
        const name = fragment.treasure_name ?? "名もなき価値観";
        const acc = newTreasureAccum.get(name);
        newTreasureAccum.set(name, {
          fragment: acc?.fragment ?? fragment,
          totalGain: (acc?.totalGain ?? 0) + gain,
          sites: [...(acc?.sites ?? []), ...siteEntries],
        });
      }
    }

    // Pass 2a: 既存価値観を並列UPDATE
    await Promise.all(
      [...existingTreasureAccum.entries()].map(([treasure_id, { totalGain, act_category }]) =>
        supabase.from("treasure_collection").update({
          level: (treasureLevelMap.get(treasure_id) ?? 1) + totalGain,
          ...(act_category ? { act_category } : {}),
        }).eq("id", treasure_id)
      )
    );

    // Pass 2b: 新規価値観を並列INSERT
    const newTreasureEntries = [...newTreasureAccum.entries()];
    const insertedTreasures = await Promise.all(
      newTreasureEntries.map(([, { fragment, totalGain }]) =>
        supabase.from("treasure_collection").insert({
          user_id: user.id,
          treasure_name: fragment.treasure_name ?? "名もなき価値観",
          description: fragment.description ?? null,
          keywords: fragment.keywords ?? [],
          fulfillment_state: fragment.fulfillment_state ?? null,
          threat_signal: fragment.threat_signal ?? null,
          act_category: fragment.act_category ?? null,
          level: totalGain,
        }).select("id").single()
      )
    );

    // dig_sites を一括INSERT
    const allDigSiteInserts: { user_id: string; treasure_id: string; log_id: string; site: string }[] = [];

    for (const [treasure_id, { sites }] of existingTreasureAccum) {
      for (const { log, site } of sites) {
        allDigSiteInserts.push({ user_id: user.id, treasure_id, log_id: log.id, site });
      }
    }
    for (let i = 0; i < newTreasureEntries.length; i++) {
      const { data: newTreasure, error: insertError } = insertedTreasures[i];
      if (insertError || !newTreasure) {
        throw new Error(`価値観の作成に失敗しました: ${insertError?.message ?? "newTreasure is null"}`);
      }
      newTreasureIdSet.add(newTreasure.id);
      analyzedTreasureIdSet.add(newTreasure.id);
      for (const { log, site } of newTreasureEntries[i][1].sites) {
        allDigSiteInserts.push({ user_id: user.id, treasure_id: newTreasure.id, log_id: log.id, site });
      }
    }

    if (allDigSiteInserts.length > 0) {
      const { error: digSiteInsertError } = await supabase.from("dig_sites").insert(allDigSiteInserts);
      if (digSiteInsertError) {
        throw new Error(`価値観の根拠エピソードの保存に失敗しました: ${digSiteInsertError.message}`);
      }
    }

    // ── タネ（OS命名）の処理 ──────────────────────────────────────────────────
    let seedData: { seed_name: string; os_description: string; logic_reflection: string; environment_condition: string };
    try {
      seedData = JSON.parse(seedResult.response.text());
    } catch {
      console.error("タネ分析JSONパース失敗:", seedResult.response.text());
      // タネのパース失敗は致命的ではないため処理を継続
      seedData = { seed_name: "", os_description: "", logic_reflection: "", environment_condition: "" };
    }

    if (seedData.seed_name) {
      const week_number = logs[0]?.week_number ?? 1;
      await supabase.from("seeds_collection").upsert(
        { user_id: user.id, week_number, ...seedData },
        { onConflict: "user_id,week_number" }
      );
    }

    // ログを分析済みにマーク
    const logIds = logs.map(l => l.id);
    await supabase
      .from("daily_logs")
      .update({ is_analyzed: true })
      .in("id", logIds);

    // 累計ログ数を取得してプロフィール更新
    const { count: totalLogsCount } = await supabase
      .from("daily_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    await supabase
      .from("user_profiles")
      .update({
        total_analyses_count: status.totalAnalysesCount + 1,
        total_logs_at_last_analysis: totalLogsCount ?? 0,
      })
      .eq("id", user.id);

    // 更新後の花・価値観一覧を返す（並列）
    const [{ data: updatedFlowers }, { data: updatedTreasures }] = await Promise.all([
      supabase
        .from("flower_collection")
        .select("id, flower_name, level")
        .eq("user_id", user.id)
        .order("level", { ascending: false }),
      supabase
        .from("treasure_collection")
        .select("id, treasure_name, level")
        .eq("user_id", user.id)
        .order("level", { ascending: false }),
    ]);

    const newFlowers = (updatedFlowers ?? []).filter(f => newFlowerIdSet.has(f.id));
    const newTreasures = (updatedTreasures ?? []).filter(t => newTreasureIdSet.has(t.id));
    const analyzedFlowers = (updatedFlowers ?? []).filter(f => analyzedFlowerIdSet.has(f.id));
    const analyzedTreasures = (updatedTreasures ?? []).filter(t => analyzedTreasureIdSet.has(t.id));

    return NextResponse.json({
      flowers: analyzedFlowers,
      fragment_count: flowerFragments.length,
      treasures: analyzedTreasures,
      treasure_count: treasureFragments.length,
      new_flowers: newFlowers,
      new_treasures: newTreasures,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("POST /api/analyze error:", msg);
    if (msg.includes("503") || msg.toLowerCase().includes("service unavailable") || msg.toLowerCase().includes("high demand")) {
      return NextResponse.json({ error: "AI分析サービスが混雑しています。しばらく時間をおいて再度お試しください。" }, { status: 503 });
    }
    return NextResponse.json({ error: "分析中にエラーが発生しました。再度お試しください。" }, { status: 500 });
  }
}
