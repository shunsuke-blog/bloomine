"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { hasAccessWithFreeTrial } from "@/lib/subscription";
import { GemIcon, GEM_BG, GEM_ACCENT } from "@/components/GemIcon";
import { levelOpacity } from "@/lib/level-utils";
import { ACT_LABEL } from "@/lib/categories";

type DigSite = {
  id: string;
  site: string;
  log_id: string;
  daily_logs: {
    transcript: string;
    emotion_score: number | null;
    created_at: string;
  } | null;
};

type Treasure = {
  id: string;
  treasure_name: string;
  level: number;
  description: string | null;
  keywords: string[] | null;
  fulfillment_state: string | null;
  threat_signal: string | null;
  act_category: string | null;
  sites: DigSite[];
};


function TreasureModal({ treasure, onClose }: { treasure: Treasure; onClose: () => void }) {
  const [openSiteId, setOpenSiteId] = useState<string | null>(null);
  const accent = GEM_ACCENT[treasure.act_category ?? ""] ?? "text-amber-300";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-8 h-1 bg-slate-700 rounded-full" />
        </div>
        <div className="px-6 pt-3 pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* 宝石アイコン */}
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 shrink-0 ${GEM_BG[treasure.act_category ?? ""] ?? "bg-slate-800/50 border-slate-700/30"}`}>
              <GemIcon act_category={treasure.act_category} />
            </div>
            <div className="space-y-1.5">
              <p className={`text-lg font-light tracking-wide leading-snug ${accent}`}>{treasure.treasure_name}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${accent} bg-slate-800/60 border-slate-700/50`}>
                  Lv.{treasure.level}
                </span>
                {treasure.act_category && (
                  <span className={`text-xs ${accent} opacity-60`}>
                    {ACT_LABEL[treasure.act_category]}
                  </span>
                )}
                <span className="text-xs text-slate-600">{treasure.sites.length}件の発掘場所</span>
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
          {treasure.description && (
            <div className="space-y-1.5">
              <p className={`text-xs tracking-wider ${accent} opacity-70`}>宝物の解説</p>
              <p className="text-sm text-slate-300 leading-relaxed">{treasure.description}</p>
            </div>
          )}
          {treasure.fulfillment_state && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-600 tracking-wider">✦ さらに光輝かせるために</p>
              <p className="text-sm text-slate-300 leading-relaxed">{treasure.fulfillment_state}</p>
            </div>
          )}
          {treasure.threat_signal && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-600 tracking-wider">⚠ 宝を失わないために</p>
              <p className="text-sm text-slate-300 leading-relaxed">{treasure.threat_signal}</p>
            </div>
          )}
          {treasure.keywords && treasure.keywords.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 tracking-wider">キーワード</p>
              <div className="flex flex-wrap gap-2">
                {treasure.keywords.map((kw, i) => (
                  <span key={i}
                    className={`text-xs px-2 py-0.5 bg-slate-800/60 border border-slate-700/50 rounded-full ${accent} opacity-80`}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {treasure.sites.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/40">
              <p className="text-xs text-slate-600 tracking-wider mb-3">発掘場所（証拠）</p>
              {treasure.sites.map((site) => (
                <div key={site.id} className="space-y-1">
                  <button
                    onClick={() => setOpenSiteId(openSiteId === site.id ? null : site.id)}
                    className="w-full text-left p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <p className="text-xs text-slate-400 leading-relaxed">{site.site}</p>
                    <p className="text-xs text-slate-700 mt-1">
                      {openSiteId === site.id ? "▲ 閉じる" : "▼ 元のエピソードを見る"}
                    </p>
                  </button>
                  {openSiteId === site.id && site.daily_logs && (
                    <div className="ml-3 p-3 bg-slate-900/30 border-l border-slate-700/40 rounded-r-xl">
                      {site.daily_logs.emotion_score !== null && (
                        <p className="text-xs text-slate-600 mb-1">
                          感情スコア: {site.daily_logs.emotion_score}/10
                        </p>
                      )}
                      <p className="text-xs text-slate-500 leading-relaxed">{site.daily_logs.transcript}</p>
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

function TreasureGridCard({ treasure, onClick }: { treasure: Treasure; onClick: () => void }) {
  const bg = GEM_BG[treasure.act_category ?? ""] ?? "bg-slate-800/30 border-slate-700/30";
  const accent = GEM_ACCENT[treasure.act_category ?? ""] ?? "text-amber-300";
  const opacity = levelOpacity(treasure.level);

  return (
    <button
      onClick={onClick}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 text-left hover:bg-slate-900 transition-all active:scale-95 w-full"
    >
      <div
        className={`w-full aspect-square rounded-xl border flex items-center justify-center p-4 ${bg}`}
        style={{ opacity }}
      >
        <GemIcon act_category={treasure.act_category} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-light tracking-wide leading-snug line-clamp-2 ${accent}`} style={{ opacity }}>
          {treasure.treasure_name}
        </p>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-slate-900/60 border-slate-700/50 ${accent} shrink-0`}>
          Lv.{treasure.level}
        </span>
        <span className="text-[10px] text-slate-600 text-right">{treasure.sites.length}件の発掘</span>
      </div>
    </button>
  );
}

export default function TreasuresPage() {
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [selected, setSelected] = useState<Treasure | null>(null);
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);
  const router = useRouter();

  const hasUnclassified = treasures.some((t) => !t.act_category);
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
      setBackfillMsg(`完了: 宝石${json.treasures}件を分類しました`);
      const r = await fetch("/api/treasures");
      const data = await r.json();
      if (Array.isArray(data)) setTreasures(data);
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
      fetch("/api/treasures")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setTreasures(data); })
        .finally(() => setLoading(false));
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950">
      <PageHeader title="価値観の宝庫" subtitle="あなたが大切にしてきた、宝物たち" titleClass="text-amber-400" />
      <main className="text-slate-200 px-4 pt-safe-header pb-safe-nav sm:px-6 max-w-lg mx-auto space-y-6">

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
        ) : treasures.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-slate-600 text-sm">まだ宝物が見つかっていません</p>
            <p className="text-slate-700 text-xs">3日間ログを記録すると、価値観の宝物が現れます</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {treasures.map((treasure) => (
              <TreasureGridCard key={treasure.id} treasure={treasure} onClick={() => setSelected(treasure)} />
            ))}
          </div>
        )}
      </main>

      {selected && <TreasureModal treasure={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
