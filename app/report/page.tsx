"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { hasAccessWithFreeTrial } from "@/lib/subscription";

type PyramidValue = {
  id: string;
  treasure_name: string;
  level: number;
  description: string | null;
  fulfillment_state: string | null;
};

type WeeklySeed = {
  id: string;
  week_number: number;
  seed_name: string;
  os_description: string | null;
  logic_reflection: string | null;
  environment_condition: string | null;
  created_at: string;
};

type RadarData = {
  wisdom: number;
  courage: number;
  humanity: number;
  justice: number;
  temperance: number;
  transcendence: number;
};

const VIA_LABELS: { key: keyof RadarData; label: string; sub: string }[] = [
  { key: "wisdom",        label: "知恵",   sub: "Wisdom" },
  { key: "courage",       label: "勇気",   sub: "Courage" },
  { key: "humanity",      label: "人間性", sub: "Humanity" },
  { key: "justice",       label: "公正",   sub: "Justice" },
  { key: "temperance",    label: "節制",   sub: "Temperance" },
  { key: "transcendence", label: "超越",   sub: "Transcendence" },
];

function RadarChart({ data }: { data: RadarData }) {
  const cx = 150;
  const cy = 150;
  const maxR = 100;
  const levels = 4;
  const n = VIA_LABELS.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (r: number, i: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const maxVal = Math.max(...VIA_LABELS.map(v => data[v.key]), 1);

  const dataPoints = VIA_LABELS.map((v, i) => {
    const ratio = Math.min(data[v.key] / maxVal, 1);
    // 値0でも最小表示（5%）
    const r = maxR * (ratio > 0 ? 0.05 + ratio * 0.95 : 0);
    return point(r, i);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
        {/* グリッド */}
        {Array.from({ length: levels }).map((_, li) => {
          const r = maxR * ((li + 1) / levels);
          const pts = VIA_LABELS.map((_, i) => point(r, i));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
          return <path key={li} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}

        {/* 軸線 */}
        {VIA_LABELS.map((_, i) => {
          const outer = point(maxR, i);
          return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
        })}

        {/* データポリゴン */}
        <path d={dataPath} fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" />

        {/* 頂点ドット */}
        {dataPoints.map((p, i) => (
          data[VIA_LABELS[i].key] > 0
            ? <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgba(52,211,153,0.9)" />
            : null
        ))}

        {/* ラベル */}
        {VIA_LABELS.map((v, i) => {
          const labelR = maxR + 26;
          const p = point(labelR, i);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle">
              <tspan x={p.x} dy="-6" fontSize="11" fill="rgba(226,232,240,0.85)" fontWeight="300">{v.label}</tspan>
              <tspan x={p.x} dy="13" fontSize="8" fill="rgba(148,163,184,0.45)">{v.sub}</tspan>
            </text>
          );
        })}
      </svg>

      {/* 凡例 */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-2 w-full max-w-[280px]">
        {VIA_LABELS.map(v => (
          <div key={v.key} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 shrink-0" />
            <span className="text-[10px] text-slate-500 tracking-wide">{v.label}</span>
            <span className="text-[10px] text-slate-600 ml-auto">{data[v.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const APEX_HEIGHT = 32;
const TIER_HEIGHT = 54;
const DESC_HEIGHT = 80;
const EASE = "0.42s cubic-bezier(0.4, 0, 0.2, 1)";

// 参考画像と同じ緑→青グラデーション、透明度を高めてダーク背景に馴染ませる
const TIER_CONFIG = [
  { bg: "bg-emerald-400/20", text: "text-emerald-50", sep: "border-white/8" },
  { bg: "bg-teal-400/20",    text: "text-teal-50",    sep: "border-white/8" },
  { bg: "bg-cyan-500/20",    text: "text-cyan-50",    sep: "border-white/8" },
  { bg: "bg-blue-500/20",    text: "text-blue-50",    sep: "border-white/8" },
  { bg: "bg-blue-700/25",    text: "text-blue-50",    sep: "" },
];

function ValuePyramid({ values }: { values: PyramidValue[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const tiers = values.slice(0, 5);

  if (tiers.length === 0) {
    return (
      <p className="text-slate-600 text-sm text-center py-8">
        まだ価値観が見つかっていません
      </p>
    );
  }

  const baseHeight = APEX_HEIGHT + tiers.length * TIER_HEIGHT;
  const totalHeight = baseHeight + (selectedIndex !== null ? DESC_HEIGHT : 0);

  const handleTap = (i: number) => {
    setSelectedIndex((prev) => (prev === i ? null : i));
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div
        className="relative w-[85%]"
        style={{
          height: totalHeight,
          transition: `height ${EASE}`,
        }}
      >
          {/* ── 背景レイヤー（clip-path で三角形） ── */}
          <div
            className="absolute inset-0"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          >
            <div style={{ height: APEX_HEIGHT }} className={TIER_CONFIG[0].bg} />
            {tiers.map((v, i) => {
              const cfg = TIER_CONFIG[i];
              const isSelected = selectedIndex === i;
              return (
                <div key={v.id}>
                  <div
                    style={{ height: TIER_HEIGHT }}
                    className={`w-full ${cfg.bg} ${
                      i < tiers.length - 1 && !isSelected ? `border-b ${cfg.sep}` : ""
                    }`}
                  />
                  <div
                    style={{
                      height: isSelected ? DESC_HEIGHT : 0,
                      overflow: "hidden",
                      transition: `height ${EASE}`,
                    }}
                    className={`w-full ${cfg.bg}`}
                  />
                  {isSelected && i < tiers.length - 1 && (
                    <div className={`border-b ${cfg.sep}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── テキストレイヤー（clip なし、文字はみ出し可） ── */}
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ height: APEX_HEIGHT }} />
            {tiers.map((v, i) => {
              const cfg = TIER_CONFIG[i];
              const isSelected = selectedIndex === i;
              const desc = v.fulfillment_state ?? v.description ?? "";
              return (
                <div key={v.id}>
                  <div
                    style={{ height: TIER_HEIGHT }}
                    className="flex flex-col items-center justify-center"
                  >
                    <span className={`text-base font-light tracking-widest ${cfg.text}`}>
                      {v.treasure_name}
                    </span>
                    <span
                      className={`text-[10px] mt-1 ${cfg.text} opacity-40 transition-transform duration-300 ${
                        isSelected ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                  <div
                    style={{
                      height: isSelected ? DESC_HEIGHT : 0,
                      overflow: "hidden",
                      transition: `height ${EASE}`,
                    }}
                    className="flex items-center justify-center"
                  >
                    {desc && (
                      <p className={`text-xs text-center leading-relaxed px-[18%] ${cfg.text} opacity-80`}>
                        {desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── タッチレイヤー ── */}
          <div className="absolute inset-0">
            <div style={{ height: APEX_HEIGHT }} />
            {tiers.map((v, i) => {
              const isSelected = selectedIndex === i;
              return (
                <div key={v.id}>
                  <button
                    onClick={() => handleTap(i)}
                    style={{ height: TIER_HEIGHT }}
                    className="w-full block cursor-pointer"
                  />
                  <div
                    style={{
                      height: isSelected ? DESC_HEIGHT : 0,
                      overflow: "hidden",
                      transition: `height ${EASE}`,
                    }}
                  />
                </div>
              );
            })}
          </div>
      </div>

      <p className="text-xs text-slate-700 tracking-wider">
        頂点 = 最も深く根付いた価値観
      </p>
    </div>
  );
}

function SeedCard({ seed }: { seed: WeeklySeed }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 text-left hover:bg-slate-900/40 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs text-slate-600 tracking-wider">Week {seed.week_number}</p>
            <p className="text-base font-light text-amber-300 tracking-wide">{seed.seed_name}</p>
            {seed.os_description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {seed.os_description}
              </p>
            )}
          </div>
          <span className="text-xs text-slate-700 mt-1 shrink-0">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (seed.logic_reflection || seed.environment_condition) && (
        <div className="border-t border-slate-800/60 bg-slate-950/40 p-5 space-y-4">
          {seed.logic_reflection && (
            <div className="space-y-1">
              <p className="text-xs text-slate-600 tracking-wider">過去の苦しみの再定義</p>
              <p className="text-sm text-slate-400 leading-relaxed">{seed.logic_reflection}</p>
            </div>
          )}
          {seed.environment_condition && (
            <div className="space-y-1">
              <p className="text-xs text-slate-600 tracking-wider">輝ける土壌</p>
              <p className="text-sm text-slate-400 leading-relaxed">{seed.environment_condition}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const EMPTY_RADAR: RadarData = { wisdom: 0, courage: 0, humanity: 0, justice: 0, temperance: 0, transcendence: 0 };

export default function ReportPage() {
  const [pyramidValues, setPyramidValues] = useState<PyramidValue[]>([]);
  const [weeklySeeds, setWeeklySeeds] = useState<WeeklySeed[]>([]);
  const [radarData, setRadarData] = useState<RadarData>(EMPTY_RADAR);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

      fetch("/api/report")
        .then((r) => r.json())
        .then((data) => {
          if (data.pyramidValues) setPyramidValues(data.pyramidValues);
          if (data.weeklySeeds) setWeeklySeeds(data.weeklySeeds);
          if (data.radarData) setRadarData(data.radarData);
        })
        .finally(() => setLoading(false));
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="text-slate-200 px-4 py-6 sm:px-6 max-w-lg mx-auto space-y-10">

        {/* ヘッダー */}
        <div className="relative flex items-center justify-center pt-4">
          <Link href="/" className="absolute left-0 text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← 戻る
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-light tracking-widest text-slate-200">成長レポート</h1>
            <p className="text-xs text-slate-600 mt-1">あなたの内側に積み重なったもの</p>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600 text-sm animate-pulse text-center py-12">読み込み中...</p>
        ) : (
          <>
            {/* 価値観ピラミッド */}
            <section className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-light tracking-widest text-amber-400/70">価値観ピラミッド</h2>
                {pyramidValues.length > 0 && (
                  <p className="text-xs text-slate-600">
                    上位 {Math.min(pyramidValues.length, 5)} つの価値観
                  </p>
                )}
              </div>
              <ValuePyramid values={pyramidValues} />
            </section>

            {/* 強みレーダーチャート */}
            <section className="space-y-4 border-t border-slate-800/60 pt-8">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-light tracking-widest text-emerald-400/70">強みの型</h2>
                <p className="text-xs text-slate-600">VIA強み分類（Peterson & Seligman, 2004）</p>
              </div>
              {Object.values(radarData).every(v => v === 0) ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-slate-600 text-sm">まだデータがありません</p>
                  <p className="text-slate-700 text-xs">分析を実行すると強みの型が可視化されます</p>
                </div>
              ) : (
                <RadarChart data={radarData} />
              )}
            </section>

            {/* 週次カード */}
            <section className="space-y-4 border-t border-slate-800/60 pt-8">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-light tracking-widest text-slate-400">週次OS記録</h2>
                <p className="text-xs text-slate-600">AIが見つけた、週ごとのあなたの性質</p>
              </div>
              {weeklySeeds.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-slate-600 text-sm">まだ記録がありません</p>
                  <p className="text-slate-700 text-xs">
                    3日間ログを記録して分析すると、週のOSが命名されます
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weeklySeeds.map((seed) => (
                    <SeedCard key={seed.id} seed={seed} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
