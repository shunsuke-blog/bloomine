"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { hasAccessWithFreeTrial } from "@/lib/subscription";
import { FlowerIcon, FLOWER_BG, FLOWER_ACCENT } from "@/components/FlowerIcon";

type Root = {
  id: string;
  root: string;
  log_id: string;
  daily_logs: {
    transcript: string;
    emotion_score: number | null;
    created_at: string;
  } | null;
};

type Flower = {
  id: string;
  flower_name: string;
  level: number;
  os_description: string | null;
  logic_reflection: string | null;
  environment_condition: string | null;
  via_category: string | null;
  roots: Root[];
};

const VIA_LABEL: Record<string, string> = {
  courage:       "勇気",
  wisdom:        "知恵",
  humanity:      "人間性",
  justice:       "正義",
  temperance:    "節制",
  transcendence: "超越",
};

function FlowerModal({ flower, onClose }: { flower: Flower; onClose: () => void }) {
  const [openRootId, setOpenRootId] = useState<string | null>(null);
  const accent = FLOWER_ACCENT[flower.via_category ?? ""] ?? "text-emerald-300";
  const borderHover = flower.via_category ? "" : "border-emerald-900/40";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-8 h-1 bg-slate-700 rounded-full" />
        </div>
        <div className="px-6 pt-3 pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* 花アイコン */}
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 shrink-0 ${FLOWER_BG[flower.via_category ?? ""] ?? "bg-slate-800/50 border-slate-700/30"}`}>
              <FlowerIcon via_category={flower.via_category} />
            </div>
            <div className="space-y-1.5">
              <p className={`text-lg font-light tracking-wide leading-snug ${accent}`}>{flower.flower_name}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${accent} bg-slate-800/60 border-slate-700/50`}>
                  Lv.{flower.level}
                </span>
                {flower.via_category && (
                  <span className={`text-xs ${accent} opacity-60`}>
                    {VIA_LABEL[flower.via_category]}
                  </span>
                )}
                <span className="text-xs text-slate-600">{flower.roots.length}件の根</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors p-1 mt-0.5 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-10 space-y-5">
          {flower.os_description && (
            <div className="space-y-1.5">
              <p className={`text-xs tracking-wider ${accent} opacity-70`}>花の解説</p>
              <p className="text-sm text-slate-300 leading-relaxed">{flower.os_description}</p>
            </div>
          )}
          {flower.logic_reflection && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-600 tracking-wider">過去の苦しみの再定義</p>
              <p className="text-sm text-slate-400 leading-relaxed">{flower.logic_reflection}</p>
            </div>
          )}
          {flower.environment_condition && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-600 tracking-wider">輝ける土壌</p>
              <p className="text-sm text-slate-400 leading-relaxed">{flower.environment_condition}</p>
            </div>
          )}
          {flower.roots.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/40">
              <p className="text-xs text-slate-600 tracking-wider mb-3">根っこ（証拠）</p>
              {flower.roots.map((root) => (
                <div key={root.id} className="space-y-1">
                  <button
                    onClick={() => setOpenRootId(openRootId === root.id ? null : root.id)}
                    className={`w-full text-left p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:${borderHover} transition-colors`}
                  >
                    <p className="text-xs text-slate-400 leading-relaxed">{root.root}</p>
                    <p className="text-xs text-slate-700 mt-1">
                      {openRootId === root.id ? "▲ 閉じる" : "▼ 元のエピソードを見る"}
                    </p>
                  </button>
                  {openRootId === root.id && root.daily_logs && (
                    <div className="ml-3 p-3 bg-slate-900/30 border-l border-slate-700/40 rounded-r-xl">
                      {root.daily_logs.emotion_score !== null && (
                        <p className="text-xs text-slate-600 mb-1">
                          感情スコア: {root.daily_logs.emotion_score}/10
                        </p>
                      )}
                      <p className="text-xs text-slate-500 leading-relaxed">{root.daily_logs.transcript}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function levelOpacity(level: number): number {
  return Math.min(0.25 + (level - 1) * 0.08, 1.0);
}

function FlowerGridCard({ flower, onClick }: { flower: Flower; onClick: () => void }) {
  const bg = FLOWER_BG[flower.via_category ?? ""] ?? "bg-slate-800/30 border-slate-700/30";
  const accent = FLOWER_ACCENT[flower.via_category ?? ""] ?? "text-slate-300";
  const opacity = levelOpacity(flower.level);

  return (
    <button
      onClick={onClick}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 text-left hover:bg-slate-900 transition-all active:scale-95 w-full"
    >
      <div
        className={`w-full aspect-square rounded-xl border flex items-center justify-center p-4 ${bg}`}
        style={{ opacity }}
      >
        <FlowerIcon via_category={flower.via_category} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-light tracking-wide leading-snug line-clamp-2 ${accent}`} style={{ opacity }}>
          {flower.flower_name}
        </p>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-slate-900/60 border-slate-700/50 ${accent} shrink-0`}>
          Lv.{flower.level}
        </span>
        <span className="text-[10px] text-slate-600 text-right">{flower.roots.length}件の根</span>
      </div>
    </button>
  );
}

export default function FlowersPage() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [selected, setSelected] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);
  const router = useRouter();

  const hasUnclassified = flowers.some((f) => !f.via_category);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  async function handleBackfill() {
    setBackfilling(true);
    setBackfillMsg(null);
    try {
      const res = await fetch("/api/backfill-categories", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setBackfillMsg(`エラー: ${json.error ?? res.status}`);
        return;
      }
      setBackfillMsg(`完了: 花${json.flowers}件を分類しました`);
      const r = await fetch("/api/flowers");
      const data = await r.json();
      if (Array.isArray(data)) setFlowers(data);
    } catch (e) {
      setBackfillMsg(`通信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBackfilling(false);
    }
  }

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_admin, subscription_status, created_at")
        .eq("id", user.id)
        .maybeSingle();
      if (!hasAccessWithFreeTrial(profile)) { router.push("/upgrade"); return; }
      fetch("/api/flowers")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setFlowers(data); })
        .finally(() => setLoading(false));
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="text-slate-200 px-4 py-6 sm:px-6 max-w-lg mx-auto space-y-6">
        <div className="relative flex items-center justify-center pt-4">
          <Link href="/" className="absolute left-0 text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← 戻る
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-light tracking-widest text-emerald-400">強みの庭</h1>
            <p className="text-xs text-slate-600 mt-1">積み重ねられた、あなたの性質たち</p>
          </div>
        </div>

        {hasUnclassified && !loading && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleBackfill}
              disabled={backfilling}
              className="text-xs text-slate-600 hover:text-slate-400 border border-slate-800 hover:border-slate-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
            >
              {backfilling ? "分類中..." : "✦ デザインを割り当てる"}
            </button>
            {backfillMsg && (
              <p className="text-xs text-slate-500">{backfillMsg}</p>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-slate-600 text-sm animate-pulse text-center py-12">読み込み中...</p>
        ) : flowers.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-slate-600 text-sm">まだ花が咲いていません</p>
            <p className="text-slate-700 text-xs">3日間ログを記録すると、強みの花が咲きます</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {flowers.map((flower) => (
              <FlowerGridCard key={flower.id} flower={flower} onClick={() => setSelected(flower)} />
            ))}
          </div>
        )}
      </main>

      {selected && <FlowerModal flower={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
