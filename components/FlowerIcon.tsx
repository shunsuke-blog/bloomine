// VIA カテゴリに対応した花SVGコンポーネント

function FlowerCamellia() {
  // ツバキ - 勇気 (orange)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-28" rx="12" ry="18"
            transform={`rotate(${a})`}
            fill="rgba(251,146,60,0.18)" stroke="rgba(251,146,60,0.5)" strokeWidth="0.8" />
        ))}
        {[36, 108, 180, 252, 324].map((a) => (
          <ellipse key={a} cx="0" cy="-17" rx="9" ry="13"
            transform={`rotate(${a})`}
            fill="rgba(251,146,60,0.32)" stroke="rgba(251,146,60,0.65)" strokeWidth="0.8" />
        ))}
        <circle cx="0" cy="0" r="8" fill="rgba(251,146,60,0.8)" stroke="rgba(234,88,12,0.6)" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="4.5" fill="rgba(234,88,12,0.95)" />
      </g>
    </svg>
  );
}

function FlowerCrystal() {
  // クリスタル - 知恵 (cyan)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M 0,0 L 9,-18 L 0,-42 L -9,-18 Z"
            transform={`rotate(${a})`}
            fill="rgba(34,211,238,0.18)" stroke="rgba(34,211,238,0.7)" strokeWidth="0.8" />
        ))}
        <circle cx="0" cy="0" r="9" fill="rgba(34,211,238,0.55)" stroke="rgba(6,182,212,0.8)" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="5" fill="rgba(6,182,212,0.95)" />
      </g>
    </svg>
  );
}

function FlowerSakura() {
  // サクラ - 人間性 (rose)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a}
            d="M 0,-7 C -9,-13 -13,-24 -9,-33 Q 0,-42 9,-33 C 13,-24 9,-13 0,-7 Z"
            transform={`rotate(${a})`}
            fill="rgba(254,205,211,0.35)" stroke="rgba(251,113,133,0.6)" strokeWidth="0.9" />
        ))}
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          const len = 9;
          return (
            <g key={a}>
              <line x1={0} y1={0} x2={len * Math.cos(rad)} y2={len * Math.sin(rad)}
                stroke="rgba(251,113,133,0.4)" strokeWidth="0.6" />
              <circle cx={len * Math.cos(rad)} cy={len * Math.sin(rad)}
                r="1.3" fill="rgba(251,191,36,0.85)" />
            </g>
          );
        })}
        <circle cx="0" cy="0" r="5.5" fill="rgba(251,113,133,0.55)" />
        <circle cx="0" cy="0" r="3" fill="rgba(244,63,94,0.9)" />
      </g>
    </svg>
  );
}

function FlowerKiku() {
  // 菊 - 正義 (amber)
  const n = 16;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {Array.from({ length: n }, (_, i) => i * (360 / n)).map((a) => (
          <ellipse key={`o${a}`} cx="0" cy="-26" rx="5" ry="16"
            transform={`rotate(${a})`}
            fill="rgba(251,191,36,0.2)" stroke="rgba(251,191,36,0.6)" strokeWidth="0.7" />
        ))}
        {Array.from({ length: n }, (_, i) => i * (360 / n) + 360 / (n * 2)).map((a) => (
          <ellipse key={`i${a}`} cx="0" cy="-16" rx="4" ry="10"
            transform={`rotate(${a})`}
            fill="rgba(251,191,36,0.28)" stroke="rgba(251,191,36,0.5)" strokeWidth="0.6" />
        ))}
        <circle cx="0" cy="0" r="7" fill="rgba(234,179,8,0.8)" stroke="rgba(251,191,36,0.5)" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="4" fill="rgba(161,98,7,0.95)" />
      </g>
    </svg>
  );
}

function FlowerUme() {
  // 梅 - 節制 (white)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx="0" cy="-22" r="15"
            transform={`rotate(${a})`}
            fill="rgba(248,250,252,0.1)" stroke="rgba(226,232,240,0.6)" strokeWidth="0.9" />
        ))}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          return (
            <line key={a} x1={0} y1={0} x2={10 * Math.cos(rad)} y2={10 * Math.sin(rad)}
              stroke="rgba(226,232,240,0.35)" strokeWidth="0.6" />
          );
        })}
        <circle cx="0" cy="0" r="6" fill="rgba(226,232,240,0.35)" stroke="rgba(248,250,252,0.4)" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="3" fill="rgba(248,250,252,0.9)" />
      </g>
    </svg>
  );
}

function FlowerKikyo() {
  // 桔梗 - 超越 (violet)
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a}
            d="M 0,-6 C -16,-8 -20,-24 -12,-36 Q 0,-44 12,-36 C 20,-24 16,-8 0,-6 Z"
            transform={`rotate(${a})`}
            fill="rgba(167,139,250,0.22)" stroke="rgba(139,92,246,0.65)" strokeWidth="0.9" />
        ))}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          return (
            <line key={a} x1={0} y1={0} x2={10 * Math.cos(rad)} y2={10 * Math.sin(rad)}
              stroke="rgba(139,92,246,0.35)" strokeWidth="0.6" />
          );
        })}
        <circle cx="0" cy="0" r="7" fill="rgba(124,58,237,0.7)" />
        <circle cx="0" cy="0" r="3.5" fill="rgba(109,40,217,0.95)" />
      </g>
    </svg>
  );
}

function FlowerDefault() {
  // デフォルト（via_category未設定）
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-25" rx="10" ry="16"
            transform={`rotate(${a})`}
            fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
        ))}
        <circle cx="0" cy="0" r="8" fill="rgba(100,116,139,0.4)" />
        <circle cx="0" cy="0" r="4" fill="rgba(100,116,139,0.7)" />
      </g>
    </svg>
  );
}

const FLOWER_MAP: Record<string, () => JSX.Element> = {
  courage:       FlowerCamellia,
  wisdom:        FlowerCrystal,
  humanity:      FlowerSakura,
  justice:       FlowerKiku,
  temperance:    FlowerUme,
  transcendence: FlowerKikyo,
};

export const FLOWER_BG: Record<string, string> = {
  courage:       "bg-orange-950/30 border-orange-900/30",
  wisdom:        "bg-cyan-950/40 border-cyan-900/30",
  humanity:      "bg-rose-950/30 border-rose-900/30",
  justice:       "bg-amber-950/30 border-amber-900/30",
  temperance:    "bg-slate-800/50 border-slate-600/35",
  transcendence: "bg-violet-950/40 border-violet-900/30",
};

export const FLOWER_ACCENT: Record<string, string> = {
  courage:       "text-orange-300",
  wisdom:        "text-cyan-300",
  humanity:      "text-rose-300",
  justice:       "text-amber-300",
  temperance:    "text-slate-300",
  transcendence: "text-violet-300",
};

export function FlowerIcon({ via_category }: { via_category?: string | null }) {
  const Component = FLOWER_MAP[via_category ?? ""] ?? FlowerDefault;
  return <Component />;
}
