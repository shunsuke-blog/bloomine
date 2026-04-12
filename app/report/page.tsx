"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { hasAccessWithFreeTrial } from "@/lib/subscription";
import { GemIcon, GEM_BG, GEM_ACCENT } from "@/components/GemIcon";

const ACT_LABEL: Record<string, string> = {
  family:                "家族",
  intimate_relationship: "親密な関係",
  friendship:            "友人・社会関係",
  spirituality:          "スピリチュアリティ",
  work:                  "仕事",
  learning:              "学習・成長",
  leisure:               "余暇・趣味",
  citizenship:           "市民性・社会貢献",
  health:                "身体・健康",
  parenting:             "子育て・愛情",
};

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

type PyramidValue = {
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

const VIA_LABELS: { key: keyof RadarData; label: string; sub: string; desc: string }[] = [
  { key: "wisdom",        label: "知恵",   sub: "Wisdom",        desc: "好奇心・学習欲・創造性・洞察力・大局観。新しいことを探求し、深く理解しようとする力。" },
  { key: "courage",       label: "勇気",   sub: "Courage",       desc: "誠実さ・熱意・忍耐力・勇敢さ。困難に立ち向かい、信念を貫くための内的な強さ。" },
  { key: "humanity",      label: "人間性", sub: "Humanity",      desc: "思いやり・愛情・社会的知性。人との深いつながりを大切にし、育んでいく力。" },
  { key: "justice",       label: "公正",   sub: "Justice",       desc: "チームワーク・公平さ・リーダーシップ。集団や社会のために公正に貢献する力。" },
  { key: "temperance",    label: "節制",   sub: "Temperance",    desc: "謙虚さ・慎重さ・自己調整力。感情や行動を適切にコントロールし、調和を保つ力。" },
  { key: "transcendence", label: "超越",   sub: "Transcendence", desc: "感謝・希望・ユーモア・審美眼・スピリチュアリティ。より大きな意味や美しさとつながる力。" },
];

function RadarChart({ data }: { data: RadarData }) {
  const [infoKey, setInfoKey] = useState<keyof RadarData | null>(null);
  const cx = 160;
  const cy = 180;
  const maxR = 108;
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
    const r = maxR * (ratio > 0 ? 0.05 + ratio * 0.95 : 0);
    return point(r, i);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const infoItem = infoKey ? VIA_LABELS.find(v => v.key === infoKey) : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 320 360" className="w-full">
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
            ? <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="rgba(52,211,153,0.9)" />
            : null
        ))}

        {/* ラベル＋ⓘボタン */}
        {VIA_LABELS.map((v, i) => {
          const labelR = maxR + 28;
          const p = point(labelR, i);
          // ⓘは日本語名の右横
          const ix = p.x + 28;
          const iy = p.y - 6;
          const isActive = infoKey === v.key;
          return (
            <g key={i}>
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle">
                <tspan x={p.x} dy="-6" fontSize="12" fill="rgba(226,232,240,0.85)" fontWeight="300">{v.label}</tspan>
                <tspan x={p.x} dy="14" fontSize="8.5" fill="rgba(148,163,184,0.45)">{v.sub}</tspan>
              </text>
              {/* ⓘボタン */}
              <g
                onClick={() => setInfoKey(isActive ? null : v.key)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={ix} cy={iy} r="6"
                  fill={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)"}
                  stroke="rgba(148,163,184,0.4)"
                  strokeWidth="0.8"
                />
                <text
                  x={ix} y={iy}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="8" fontWeight="700"
                  fill="rgba(15,23,42,0.9)"
                  style={{ userSelect: "none" }}
                >
                  i
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* 凡例 */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-3 w-full">
        {VIA_LABELS.map(v => (
          <div key={v.key} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 shrink-0" />
            <span className="text-[11px] text-slate-500 tracking-wide">{v.label}</span>
            <span className="text-[11px] text-slate-600 ml-1">{data[v.key]}</span>
          </div>
        ))}
      </div>

      {/* 解説パネル */}
      {infoItem && (
        <div className="w-full bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-400/80 font-light tracking-wider">{infoItem.label}</span>
              <span className="text-xs text-slate-600 ml-2">{infoItem.sub}</span>
            </div>
            <button onClick={() => setInfoKey(null)} className="text-slate-600 hover:text-slate-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{infoItem.desc}</p>
        </div>
      )}
    </div>
  );
}

function PyramidDetailModal({ value, onClose }: { value: PyramidValue; onClose: () => void }) {
  const [openSiteId, setOpenSiteId] = useState<string | null>(null);
  const accent = GEM_ACCENT[value.act_category ?? ""] ?? "text-amber-300";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-8 h-1 bg-slate-700 rounded-full" />
        </div>
        <div className="px-6 pt-3 pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 shrink-0 ${GEM_BG[value.act_category ?? ""] ?? "bg-slate-800/50 border-slate-700/30"}`}>
              <GemIcon act_category={value.act_category} />
            </div>
            <div className="space-y-1.5">
              <p className={`text-lg font-light tracking-wide leading-snug ${accent}`}>{value.treasure_name}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${accent} bg-slate-800/60 border-slate-700/50`}>
                  Lv.{value.level}
                </span>
                {value.act_category && (
                  <span className={`text-xs ${accent} opacity-60`}>
                    {ACT_LABEL[value.act_category]}
                  </span>
                )}
                <span className="text-xs text-slate-600">{value.sites.length}件の発掘場所</span>
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
          {value.description && (
            <div className="space-y-1.5">
              <p className={`text-xs tracking-wider ${accent} opacity-70`}>宝物の解説</p>
              <p className="text-sm text-slate-300 leading-relaxed">{value.description}</p>
            </div>
          )}
          {value.fulfillment_state && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-600 tracking-wider">✦ さらに光輝かせるために</p>
              <p className="text-sm text-slate-300 leading-relaxed">{value.fulfillment_state}</p>
            </div>
          )}
          {value.threat_signal && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-600 tracking-wider">⚠ 宝を失わないために</p>
              <p className="text-sm text-slate-300 leading-relaxed">{value.threat_signal}</p>
            </div>
          )}
          {value.keywords && value.keywords.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 tracking-wider">キーワード</p>
              <div className="flex flex-wrap gap-2">
                {value.keywords.map((kw, i) => (
                  <span key={i}
                    className={`text-xs px-2 py-0.5 bg-slate-800/60 border border-slate-700/50 rounded-full ${accent} opacity-80`}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {value.sites.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/40">
              <p className="text-xs text-slate-600 tracking-wider mb-3">発掘場所（証拠）</p>
              {value.sites.map((site) => (
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

const APEX_HEIGHT = 32;
const TIER_HEIGHT = 54;

// 参考画像と同じ緑→青グラデーション、透明度を高めてダーク背景に馴染ませる
const TIER_CONFIG = [
  { bg: "bg-emerald-400/20", text: "text-emerald-50", sep: "border-white/8" },
  { bg: "bg-teal-400/20",    text: "text-teal-50",    sep: "border-white/8" },
  { bg: "bg-cyan-500/20",    text: "text-cyan-50",    sep: "border-white/8" },
  { bg: "bg-blue-500/20",    text: "text-blue-50",    sep: "border-white/8" },
  { bg: "bg-blue-700/25",    text: "text-blue-50",    sep: "" },
];

function ValuePyramid({ values, onSelect }: { values: PyramidValue[]; onSelect: (v: PyramidValue) => void }) {
  const tiers = values.slice(0, 5);

  if (tiers.length === 0) {
    return (
      <p className="text-slate-600 text-sm text-center py-8">
        まだ価値観が見つかっていません
      </p>
    );
  }

  const totalHeight = APEX_HEIGHT + tiers.length * TIER_HEIGHT;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div
        className="relative w-[85%]"
        style={{ height: totalHeight }}
      >
        {/* ── 背景レイヤー（clip-path で三角形） ── */}
        <div
          className="absolute inset-0"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
        >
          <div style={{ height: APEX_HEIGHT }} className={TIER_CONFIG[0].bg} />
          {tiers.map((v, i) => {
            const cfg = TIER_CONFIG[i];
            return (
              <div
                key={v.id}
                style={{ height: TIER_HEIGHT }}
                className={`w-full ${cfg.bg} ${i < tiers.length - 1 ? `border-b ${cfg.sep}` : ""}`}
              />
            );
          })}
        </div>

        {/* ── テキスト＋タッチレイヤー ── */}
        <div className="absolute inset-0">
          <div style={{ height: APEX_HEIGHT }} />
          {tiers.map((v, i) => {
            const cfg = TIER_CONFIG[i];
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                style={{ height: TIER_HEIGHT }}
                className="w-full flex flex-col items-center justify-center cursor-pointer"
              >
                <span className={`text-base font-light tracking-widest ${cfg.text}`}>
                  {v.treasure_name}
                </span>
              </button>
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
  const [selectedValue, setSelectedValue] = useState<PyramidValue | null>(null);
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
              <ValuePyramid values={pyramidValues} onSelect={setSelectedValue} />
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

      {selectedValue && (
        <PyramidDetailModal value={selectedValue} onClose={() => setSelectedValue(null)} />
      )}
    </div>
  );
}
