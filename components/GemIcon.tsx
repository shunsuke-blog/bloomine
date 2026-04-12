// ACT VLQ カテゴリに対応した宝石SVGコンポーネント

function GemDiamond() {
  // ダイヤモンド - 家族 (amber)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,8 84,40 50,92 16,40"
        fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.75)" strokeWidth="1" />
      <polygon points="50,8 84,40 50,40" fill="rgba(251,191,36,0.22)" />
      <polygon points="50,8 16,40 50,40" fill="rgba(251,191,36,0.1)" />
      <polygon points="16,40 84,40 50,92" fill="rgba(251,191,36,0.18)" />
      <line x1="16" y1="40" x2="84" y2="40" stroke="rgba(251,191,36,0.6)" strokeWidth="0.8" />
      <line x1="50" y1="8" x2="50" y2="40" stroke="rgba(251,191,36,0.35)" strokeWidth="0.5" />
      <line x1="50" y1="40" x2="50" y2="92" stroke="rgba(251,191,36,0.25)" strokeWidth="0.5" />
      <line x1="50" y1="8" x2="16" y2="40" stroke="rgba(251,191,36,0.3)" strokeWidth="0.5" />
      <line x1="50" y1="8" x2="84" y2="40" stroke="rgba(251,191,36,0.3)" strokeWidth="0.5" />
    </svg>
  );
}

function GemBrilliant() {
  // ブリリアント - 親密な関係 (rose)
  const r = 42, ri = 22;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const midAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r={r} fill="rgba(251,113,133,0.1)" stroke="rgba(251,113,133,0.8)" strokeWidth="1" />
      <circle cx="50" cy="50" r={ri} fill="rgba(251,113,133,0.22)" stroke="rgba(251,113,133,0.5)" strokeWidth="0.7" />
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={50 + ri * Math.cos(rad)} y1={50 + ri * Math.sin(rad)}
          x2={50 + r * Math.cos(rad)} y2={50 + r * Math.sin(rad)}
          stroke="rgba(251,113,133,0.4)" strokeWidth="0.6" />;
      })}
      {midAngles.map((a) => {
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={50 + ri * Math.cos(rad)} y1={50 + ri * Math.sin(rad)}
          x2={50 + r * Math.cos(rad)} y2={50 + r * Math.sin(rad)}
          stroke="rgba(251,113,133,0.25)" strokeWidth="0.5" />;
      })}
      <circle cx="50" cy="50" r="7" fill="rgba(244,63,94,0.95)" />
    </svg>
  );
}

function GemHexagon() {
  // ヘキサゴン - 友人・社会関係 (orange)
  const outerR = 42, innerR = 22;
  const hex = (r: number) =>
    [0, 60, 120, 180, 240, 300].map((a) => {
      const rad = ((a - 30) * Math.PI) / 180;
      return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
    });
  const outer = hex(outerR), inner = hex(innerR);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points={outer.map((p) => p.join(",")).join(" ")}
        fill="rgba(251,146,60,0.12)" stroke="rgba(251,146,60,0.8)" strokeWidth="1" />
      <polygon points={inner.map((p) => p.join(",")).join(" ")}
        fill="rgba(251,146,60,0.25)" stroke="rgba(251,146,60,0.5)" strokeWidth="0.7" />
      {outer.map((p, i) => (
        <line key={i} x1={inner[i][0]} y1={inner[i][1]} x2={p[0]} y2={p[1]}
          stroke="rgba(251,146,60,0.35)" strokeWidth="0.6" />
      ))}
      <circle cx="50" cy="50" r="7" fill="rgba(234,88,12,0.9)" />
    </svg>
  );
}

function GemPear() {
  // ペアシェイプ - スピリチュアリティ (violet)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M 50,90 C 22,72 8,52 8,36 C 8,14 92,14 92,36 C 92,52 78,72 50,90 Z"
        fill="rgba(167,139,250,0.13)" stroke="rgba(167,139,250,0.8)" strokeWidth="1" />
      <path d="M 50,14 C 30,22 8,36 50,36 C 92,36 70,22 50,14 Z"
        fill="rgba(167,139,250,0.2)" stroke="none" />
      <path d="M 8,36 C 22,52 36,72 50,90 C 64,72 78,52 92,36 Z"
        fill="rgba(167,139,250,0.1)" stroke="none" />
      <circle cx="50" cy="36" r="9" fill="rgba(139,92,246,0.55)" stroke="rgba(167,139,250,0.5)" strokeWidth="0.6" />
      <circle cx="50" cy="36" r="5" fill="rgba(124,58,237,0.95)" />
    </svg>
  );
}

function GemEmeraldCut() {
  // エメラルドカット - 仕事 (emerald)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="35,8 65,8 80,24 80,76 65,92 35,92 20,76 20,24"
        fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.8)" strokeWidth="1" />
      <polygon points="39,16 61,16 72,28 72,72 61,84 39,84 28,72 28,28"
        fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.45)" strokeWidth="0.7" />
      <rect x="33" y="30" width="34" height="40" rx="2"
        fill="rgba(52,211,153,0.22)" stroke="rgba(52,211,153,0.4)" strokeWidth="0.6" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(52,211,153,0.25)" strokeWidth="0.5" />
      <line x1="20" y1="50" x2="80" y2="50" stroke="rgba(52,211,153,0.25)" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="7" fill="rgba(16,185,129,0.9)" />
    </svg>
  );
}

function GemCrownCut() {
  // クラウンカット - 学習・成長 (cyan)
  const outerR = 42, midR = 28, innerR = 18;
  const starPoints: string[] = [];
  for (let i = 0; i < 8; i++) {
    const outerAngle = ((i * 45 - 90) * Math.PI) / 180;
    const midAngle = (((i * 45) + 22.5 - 90) * Math.PI) / 180;
    starPoints.push(`${50 + outerR * Math.cos(outerAngle)},${50 + outerR * Math.sin(outerAngle)}`);
    starPoints.push(`${50 + midR * Math.cos(midAngle)},${50 + midR * Math.sin(midAngle)}`);
  }
  const angles8 = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points={starPoints.join(" ")}
        fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.8)" strokeWidth="1" />
      <circle cx="50" cy="50" r={innerR}
        fill="rgba(34,211,238,0.25)" stroke="rgba(34,211,238,0.5)" strokeWidth="0.7" />
      {angles8.map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return <line key={a}
          x1={50 + innerR * Math.cos(rad)} y1={50 + innerR * Math.sin(rad)}
          x2={50 + outerR * Math.cos(rad)} y2={50 + outerR * Math.sin(rad)}
          stroke="rgba(34,211,238,0.35)" strokeWidth="0.6" />;
      })}
      <circle cx="50" cy="50" r="7" fill="rgba(6,182,212,0.95)" />
    </svg>
  );
}

function GemOval() {
  // オーバル - 余暇・趣味 (teal)
  const rx = 30, ry = 42, ri = { rx: 17, ry: 24 };
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="50" cy="50" rx={rx} ry={ry}
        fill="rgba(45,212,191,0.12)" stroke="rgba(45,212,191,0.8)" strokeWidth="1" />
      <ellipse cx="50" cy="50" rx={ri.rx} ry={ri.ry}
        fill="rgba(45,212,191,0.22)" stroke="rgba(45,212,191,0.45)" strokeWidth="0.7" />
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180;
        return <line key={a}
          x1={50 + ri.rx * Math.cos(rad)} y1={50 + ri.ry * Math.sin(rad)}
          x2={50 + rx * Math.cos(rad)} y2={50 + ry * Math.sin(rad)}
          stroke="rgba(45,212,191,0.35)" strokeWidth="0.6" />;
      })}
      <circle cx="50" cy="50" r="7" fill="rgba(20,184,166,0.9)" />
    </svg>
  );
}

function GemTrillion() {
  // トリリアント - 市民性・社会貢献 (blue)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,10 88,74 12,74"
        fill="rgba(96,165,250,0.12)" stroke="rgba(96,165,250,0.8)" strokeWidth="1" />
      <polygon points="50,24 74,66 26,66"
        fill="rgba(96,165,250,0.2)" stroke="rgba(96,165,250,0.45)" strokeWidth="0.7" />
      <line x1="50" y1="10" x2="50" y2="66" stroke="rgba(96,165,250,0.25)" strokeWidth="0.5" />
      <line x1="12" y1="74" x2="74" y2="28" stroke="rgba(96,165,250,0.2)" strokeWidth="0.5" />
      <line x1="88" y1="74" x2="26" y2="28" stroke="rgba(96,165,250,0.2)" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="7" fill="rgba(37,99,235,0.9)" />
    </svg>
  );
}

function GemCushion() {
  // クッション - 身体・健康 (lime)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M 28,10 Q 50,6 72,10 Q 94,28 90,50 Q 94,72 72,90 Q 50,94 28,90 Q 6,72 10,50 Q 6,28 28,10 Z"
        fill="rgba(163,230,53,0.12)" stroke="rgba(163,230,53,0.8)" strokeWidth="1" />
      <path d="M 34,20 Q 50,16 66,20 Q 82,34 80,50 Q 82,66 66,80 Q 50,84 34,80 Q 18,66 20,50 Q 18,34 34,20 Z"
        fill="rgba(163,230,53,0.2)" stroke="rgba(163,230,53,0.45)" strokeWidth="0.7" />
      <line x1="50" y1="6" x2="50" y2="94" stroke="rgba(163,230,53,0.22)" strokeWidth="0.5" />
      <line x1="6" y1="50" x2="94" y2="50" stroke="rgba(163,230,53,0.22)" strokeWidth="0.5" />
      <line x1="18" y1="18" x2="82" y2="82" stroke="rgba(163,230,53,0.15)" strokeWidth="0.5" />
      <line x1="82" y1="18" x2="18" y2="82" stroke="rgba(163,230,53,0.15)" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="7" fill="rgba(132,204,22,0.9)" />
    </svg>
  );
}

function GemHeart() {
  // ハート - 子育て・愛情 (pink)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M 50,82 C 18,62 5,40 10,24 C 14,10 28,6 38,14 C 42,17 46,21 50,27 C 54,21 58,17 62,14 C 72,6 86,10 90,24 C 95,40 82,62 50,82 Z"
        fill="rgba(244,114,182,0.12)" stroke="rgba(244,114,182,0.8)" strokeWidth="1" />
      <path d="M 10,24 C 22,18 36,20 50,27 C 36,34 18,36 10,24 Z"
        fill="rgba(244,114,182,0.2)" stroke="none" />
      <path d="M 90,24 C 78,18 64,20 50,27 C 64,34 82,36 90,24 Z"
        fill="rgba(244,114,182,0.15)" stroke="none" />
      <line x1="50" y1="27" x2="50" y2="82" stroke="rgba(244,114,182,0.22)" strokeWidth="0.5" />
      <circle cx="50" cy="42" r="9" fill="rgba(236,72,153,0.55)" stroke="rgba(244,114,182,0.5)" strokeWidth="0.6" />
      <circle cx="50" cy="42" r="5" fill="rgba(219,39,119,0.95)" />
    </svg>
  );
}

function GemDefault() {
  // デフォルト（act_category未設定）
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,8 84,40 50,92 16,40"
        fill="rgba(148,163,184,0.1)" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
      <line x1="16" y1="40" x2="84" y2="40" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" />
    </svg>
  );
}

const GEM_MAP: Record<string, () => JSX.Element> = {
  family:                GemDiamond,
  intimate_relationship: GemBrilliant,
  friendship:            GemHexagon,
  spirituality:          GemPear,
  work:                  GemEmeraldCut,
  learning:              GemCrownCut,
  leisure:               GemOval,
  citizenship:           GemTrillion,
  health:                GemCushion,
  parenting:             GemHeart,
};

export const GEM_BG: Record<string, string> = {
  family:                "bg-amber-950/30 border-amber-900/30",
  intimate_relationship: "bg-rose-950/30 border-rose-900/30",
  friendship:            "bg-orange-950/30 border-orange-900/30",
  spirituality:          "bg-violet-950/40 border-violet-900/30",
  work:                  "bg-emerald-950/40 border-emerald-900/30",
  learning:              "bg-cyan-950/40 border-cyan-900/30",
  leisure:               "bg-teal-950/40 border-teal-900/30",
  citizenship:           "bg-blue-950/40 border-blue-900/30",
  health:                "bg-lime-950/40 border-lime-900/30",
  parenting:             "bg-pink-950/30 border-pink-900/30",
};

export const GEM_ACCENT: Record<string, string> = {
  family:                "text-amber-300",
  intimate_relationship: "text-rose-300",
  friendship:            "text-orange-300",
  spirituality:          "text-violet-300",
  work:                  "text-emerald-300",
  learning:              "text-cyan-300",
  leisure:               "text-teal-300",
  citizenship:           "text-blue-300",
  health:                "text-lime-300",
  parenting:             "text-pink-300",
};

export function GemIcon({ act_category }: { act_category?: string | null }) {
  const Component = GEM_MAP[act_category ?? ""] ?? GemDefault;
  return <Component />;
}
