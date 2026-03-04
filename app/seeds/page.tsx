"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Log = {
  id: string;
  transcript: string;
  emotion_score: number | null;
  created_at: string;
};

type Seed = {
  id: string;
  week_number: number;
  analyzed_at: string;
  seed_name: string;
  os_description: string | null;
  logic_reflection: string | null;
  environment_condition: string | null;
  logs: Log[];
};

function EmotionDot({ score }: { score: number | null }) {
  if (score === null) return <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />;
  const hue = Math.round((score - 1) * 12); // 1→0° (赤寄り), 10→108° (緑)
  return (
    <span
      className="w-2 h-2 rounded-full inline-block"
      style={{ backgroundColor: `hsl(${hue}, 60%, 45%)` }}
      title={`スコア: ${score}`}
    />
  );
}

function SeedCard({ seed }: { seed: Seed }) {
  const [open, setOpen] = useState(false);
  const date = new Date(seed.analyzed_at).toLocaleDateString("ja-JP", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden">
      {/* カードヘッダー */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between hover:bg-slate-900/40 transition-colors text-left"
      >
        <div className="space-y-1">
          <p className="text-xs text-slate-600">Week {seed.week_number} · {date}</p>
          <p className="text-lg font-light text-emerald-300 tracking-wide">{seed.seed_name}</p>
          {/* 感情スコアの推移ドット */}
          <div className="flex gap-1 pt-1">
            {seed.logs.map((log) => (
              <EmotionDot key={log.id} score={log.emotion_score} />
            ))}
            {seed.logs.length === 0 && (
              <span className="text-xs text-slate-700">ログなし</span>
            )}
          </div>
        </div>
        <span className="text-slate-600 text-lg">{open ? "−" : "+"}</span>
      </button>

      {/* 展開：詳細 + ログ逆引き */}
      {open && (
        <div className="border-t border-slate-800/60 p-5 space-y-5 bg-slate-950/40">
          {/* 分析結果 */}
          <div className="space-y-3">
            {seed.os_description && (
              <div className="space-y-1">
                <p className="text-xs text-emerald-700 tracking-wider">OS（性質）</p>
                <p className="text-sm text-slate-300 leading-relaxed">{seed.os_description}</p>
              </div>
            )}
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

          {/* 根拠ログ逆引き */}
          {seed.logs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 tracking-wider border-t border-slate-800/60 pt-4">
                この週の言葉
              </p>
              {seed.logs.map((log, i) => (
                <div key={log.id} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <span className="text-xs text-slate-700">Day{i + 1}</span>
                    <EmotionDot score={log.emotion_score} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{log.transcript}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SeedsPage() {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seeds")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSeeds(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-xl font-light tracking-widest text-emerald-400">Seed Library</h1>
          <p className="text-xs text-slate-600 mt-1">あなたが育ててきたタネたち</p>
        </div>
        <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          ← 温室へ戻る
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-600 text-sm animate-pulse text-center py-12">読み込み中...</p>
      ) : seeds.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-slate-600 text-sm">まだタネがありません</p>
          <p className="text-slate-700 text-xs">7日間ログを記録すると、タネが芽吹きます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {seeds.map((seed) => (
            <SeedCard key={seed.id} seed={seed} />
          ))}
        </div>
      )}
    </main>
  );
}
