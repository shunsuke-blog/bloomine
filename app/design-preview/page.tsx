"use client";

// ─── 花のデザイン ───────────────────────────────────────────

function FlowerBloom() {
  // 5枚の丸い花びら（エメラルド）
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-27" rx="11" ry="17"
            transform={`rotate(${a})`}
            fill="rgba(52,211,153,0.22)" stroke="rgba(52,211,153,0.65)" strokeWidth="0.8" />
        ))}
        <circle cx="0" cy="0" r="12" fill="rgba(52,211,153,0.4)" stroke="rgba(52,211,153,0.75)" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="6.5" fill="rgba(16,185,129,0.95)" />
      </g>
    </svg>
  );
}

function FlowerCamellia() {
  // 外5枚＋内5枚の二重花びら（オレンジ・勇気）
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

function FlowerDaisy() {
  // 10枚の細い花びら（アンバー・正義）
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((a) => (
          <ellipse key={a} cx="0" cy="-27" rx="5" ry="16"
            transform={`rotate(${a})`}
            fill="rgba(251,191,36,0.25)" stroke="rgba(251,191,36,0.65)" strokeWidth="0.8" />
        ))}
        <circle cx="0" cy="0" r="10" fill="rgba(217,119,6,0.85)" stroke="rgba(180,83,9,0.6)" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="5.5" fill="rgba(180,83,9,0.95)" />
      </g>
    </svg>
  );
}

function FlowerCrystal() {
  // 6枚の菱形花びら（シアン）
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

function FlowerLotus() {
  // 8枚の外花びら＋4枚の内花びら（バイオレット）
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx="0" cy="-23" rx="8" ry="14"
            transform={`rotate(${a})`}
            fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.5)" strokeWidth="0.7" />
        ))}
        {[22.5, 112.5, 202.5, 292.5].map((a) => (
          <ellipse key={a} cx="0" cy="-14" rx="7" ry="11"
            transform={`rotate(${a})`}
            fill="rgba(167,139,250,0.38)" stroke="rgba(167,139,250,0.7)" strokeWidth="0.7" />
        ))}
        <circle cx="0" cy="0" r="7.5" fill="rgba(139,92,246,0.85)" />
        <circle cx="0" cy="0" r="4" fill="rgba(124,58,237,0.95)" />
      </g>
    </svg>
  );
}

function FlowerKiku() {
  // 菊（16枚の細長い花びら＋内8枚・菊紋風）- アンバー
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
  // 梅（5枚の丸い花びら・梅紋風）- ホワイト/節制
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
  // 桔梗（5枚の広い花びら・桔梗紋風）- バイオレット
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

function FlowerAsagao() {
  // 朝顔（3つの花・朝顔紋風）- ブルー
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {[0, 120, 240].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M 0,-5 C -13,-10 -19,-25 -12,-37 Q 0,-45 12,-37 C 19,-25 13,-10 0,-5 Z"
              fill="rgba(96,165,250,0.22)" stroke="rgba(59,130,246,0.6)" strokeWidth="0.9" />
            <line x1="0" y1="-5" x2="0" y2="-39" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5" />
            <line x1="0" y1="-18" x2="-11" y2="-31" stroke="rgba(59,130,246,0.18)" strokeWidth="0.4" />
            <line x1="0" y1="-18" x2="11" y2="-31" stroke="rgba(59,130,246,0.18)" strokeWidth="0.4" />
          </g>
        ))}
        <circle cx="0" cy="0" r="8" fill="rgba(37,99,235,0.55)" stroke="rgba(96,165,250,0.4)" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="4" fill="rgba(29,78,216,0.9)" />
      </g>
    </svg>
  );
}

function FlowerSakura() {
  // 桜（5枚のノッチ付き花びら＋おしべ）- サクラピンク
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {/* 5枚の桜の花びら（先端にノッチ） */}
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a}
            d="M 0,-7 C -9,-13 -13,-24 -9,-33 Q 0,-42 9,-33 C 13,-24 9,-13 0,-7 Z"
            transform={`rotate(${a})`}
            fill="rgba(254,205,211,0.35)" stroke="rgba(251,113,133,0.6)" strokeWidth="0.9" />
        ))}
        {/* おしべ（細い線＋黄色の葯） */}
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
        {/* 花芯 */}
        <circle cx="0" cy="0" r="5.5" fill="rgba(251,113,133,0.55)" />
        <circle cx="0" cy="0" r="3" fill="rgba(244,63,94,0.9)" />
      </g>
    </svg>
  );
}

// ─── 宝石のデザイン ───────────────────────────────────────────

function GemDiamond() {
  // クラシックダイヤモンド（アンバー）
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
  // ラウンドブリリアントカット・上面（ローズ）
  const r = 42;
  const ri = 22;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const midAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r={r} fill="rgba(251,113,133,0.1)" stroke="rgba(251,113,133,0.8)" strokeWidth="1" />
      <circle cx="50" cy="50" r={ri} fill="rgba(251,113,133,0.22)" stroke="rgba(251,113,133,0.5)" strokeWidth="0.7" />
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line key={a}
            x1={50 + ri * Math.cos(rad)} y1={50 + ri * Math.sin(rad)}
            x2={50 + r * Math.cos(rad)} y2={50 + r * Math.sin(rad)}
            stroke="rgba(251,113,133,0.4)" strokeWidth="0.6" />
        );
      })}
      {midAngles.map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line key={a}
            x1={50 + ri * Math.cos(rad)} y1={50 + ri * Math.sin(rad)}
            x2={50 + r * Math.cos(rad)} y2={50 + r * Math.sin(rad)}
            stroke="rgba(251,113,133,0.25)" strokeWidth="0.5" />
        );
      })}
      <circle cx="50" cy="50" r="7" fill="rgba(244,63,94,0.95)" />
    </svg>
  );
}

function GemHexagon() {
  // ヘキサゴンカット（オレンジ）
  const outerR = 42;
  const innerR = 22;
  const hex = (r: number) =>
    [0, 60, 120, 180, 240, 300].map((a) => {
      const rad = ((a - 30) * Math.PI) / 180;
      return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
    });
  const outer = hex(outerR);
  const inner = hex(innerR);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points={outer.map((p) => p.join(",")).join(" ")}
        fill="rgba(251,146,60,0.12)" stroke="rgba(251,146,60,0.8)" strokeWidth="1" />
      <polygon points={inner.map((p) => p.join(",")).join(" ")}
        fill="rgba(251,146,60,0.25)" stroke="rgba(251,146,60,0.5)" strokeWidth="0.7" />
      {outer.map((p, i) => (
        <line key={i}
          x1={inner[i][0]} y1={inner[i][1]}
          x2={p[0]} y2={p[1]}
          stroke="rgba(251,146,60,0.35)" strokeWidth="0.6" />
      ))}
      <circle cx="50" cy="50" r="7" fill="rgba(234,88,12,0.9)" />
    </svg>
  );
}

function GemPear() {
  // ペアシェイプ（バイオレット）- 直線なし
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
  // エメラルドカット・縦長長方形（エメラルド）
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
  // クラウンカット（シアン）- 8角星型の王冠
  const outerR = 42;
  const midR = 28;
  const innerR = 18;
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
      {/* 王冠型の8角星外枠 */}
      <polygon points={starPoints.join(" ")}
        fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.8)" strokeWidth="1" />
      {/* テーブル（中央の円） */}
      <circle cx="50" cy="50" r={innerR}
        fill="rgba(34,211,238,0.25)" stroke="rgba(34,211,238,0.5)" strokeWidth="0.7" />
      {/* 外側の星先からテーブルへのファセット線 */}
      {angles8.map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return (
          <line key={a}
            x1={50 + innerR * Math.cos(rad)} y1={50 + innerR * Math.sin(rad)}
            x2={50 + outerR * Math.cos(rad)} y2={50 + outerR * Math.sin(rad)}
            stroke="rgba(34,211,238,0.35)" strokeWidth="0.6" />
        );
      })}
      <circle cx="50" cy="50" r="7" fill="rgba(6,182,212,0.95)" />
    </svg>
  );
}

function GemOval() {
  // オーバル（縦長楕円ブリリアント）- ティール
  const rx = 30; const ry = 42;
  const ri = { rx: 17, ry: 24 };
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="50" cy="50" rx={rx} ry={ry}
        fill="rgba(45,212,191,0.12)" stroke="rgba(45,212,191,0.8)" strokeWidth="1" />
      <ellipse cx="50" cy="50" rx={ri.rx} ry={ri.ry}
        fill="rgba(45,212,191,0.22)" stroke="rgba(45,212,191,0.45)" strokeWidth="0.7" />
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180;
        const x1 = 50 + ri.rx * Math.cos(rad); const y1 = 50 + ri.ry * Math.sin(rad);
        const x2 = 50 + rx * Math.cos(rad);    const y2 = 50 + ry * Math.sin(rad);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(45,212,191,0.35)" strokeWidth="0.6" />;
      })}
      <circle cx="50" cy="50" r="7" fill="rgba(20,184,166,0.9)" />
    </svg>
  );
}

function GemTrillion() {
  // トリリアント（正三角形）- ブルー
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
  // クッション（丸みのある正方形）- ライム
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
  // ハート - ピンク
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

// ─── プレビューページ ──────────────────────────────────────────

const FLOWER_PATTERNS = [
  { name: "ブルーム", desc: "5枚の丸い花びら",         color: "emerald", via: "節制", component: <FlowerBloom /> },
  { name: "ツバキ",   desc: "二重の花びら",             color: "orange",  via: "勇気", component: <FlowerCamellia /> },
  { name: "デイジー", desc: "10枚の細い花びら",         color: "amber",   via: "正義", component: <FlowerDaisy /> },
  { name: "クリスタル", desc: "6枚の菱形花びら",        color: "cyan",    via: "知恵", component: <FlowerCrystal /> },
  { name: "ロータス", desc: "多重の蓮の花びら",            color: "violet", via: "超越",   component: <FlowerLotus /> },
  { name: "サクラ",   desc: "ノッチ付き5枚花びら＋おしべ", color: "rose",   via: "人間性", component: <FlowerSakura /> },
  { name: "菊",       desc: "16枚の細長い花びら・菊紋風",  color: "amber",  via: "正義",   component: <FlowerKiku /> },
  { name: "梅",       desc: "5枚の丸い花びら・梅紋風",     color: "white",  via: "節制",   component: <FlowerUme /> },
  { name: "桔梗",     desc: "5枚の広い花びら・桔梗紋風",   color: "violet", via: "超越",   component: <FlowerKikyo /> },
  { name: "朝顔",     desc: "3つの花が円形に並ぶ・朝顔紋風", color: "blue", via: "—",      component: <FlowerAsagao /> },
];

const GEM_PATTERNS = [
  { name: "ダイヤモンド",     desc: "クラシックな4面体",     color: "amber",   act: "家族",            component: <GemDiamond /> },
  { name: "ブリリアント",     desc: "ラウンドカット上面",     color: "rose",    act: "親密な関係",      component: <GemBrilliant /> },
  { name: "ヘキサゴン",       desc: "六角形カット",           color: "orange",  act: "友人・社会関係",  component: <GemHexagon /> },
  { name: "ペアシェイプ",     desc: "洋ナシ型カット",         color: "violet",  act: "スピリチュアリティ", component: <GemPear /> },
  { name: "エメラルドカット", desc: "縦長の段階カット",       color: "emerald", act: "仕事",            component: <GemEmeraldCut /> },
  { name: "クラウンカット",   desc: "8角星型の王冠カット",    color: "cyan",    act: "学習・成長",      component: <GemCrownCut /> },
  { name: "オーバル",         desc: "縦長楕円ブリリアント",   color: "teal",    act: "余暇・趣味",      component: <GemOval /> },
  { name: "トリリアント",     desc: "正三角形カット",         color: "blue",    act: "市民性・社会貢献", component: <GemTrillion /> },
  { name: "クッション",       desc: "丸みのある正方形カット", color: "lime",    act: "身体・健康",      component: <GemCushion /> },
  { name: "ハート",           desc: "ハート型カット",         color: "pink",    act: "子育て・愛情",    component: <GemHeart /> },
];

const BG_MAP: Record<string, string> = {
  emerald: "bg-emerald-950/40 border-emerald-900/30",
  rose:    "bg-rose-950/30 border-rose-900/30",
  teal:    "bg-teal-950/40 border-teal-900/30",
  cyan:    "bg-cyan-950/40 border-cyan-900/30",
  violet:  "bg-violet-950/40 border-violet-900/30",
  amber:   "bg-amber-950/30 border-amber-900/30",
  blue:    "bg-blue-950/40 border-blue-900/30",
  orange:  "bg-orange-950/30 border-orange-900/30",
  pink:    "bg-pink-950/30 border-pink-900/30",
  lime:    "bg-lime-950/40 border-lime-900/30",
  white:   "bg-slate-800/50 border-slate-600/35",
};

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-4 py-8 max-w-lg mx-auto space-y-10">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-widest text-slate-300">デザインプレビュー</h1>
        <p className="text-xs text-slate-600">花・宝石のSVGパターン</p>
      </div>

      {/* 花のデザイン */}
      <section className="space-y-4">
        <h2 className="text-sm font-light tracking-widest text-emerald-400/70 text-center border-b border-slate-800 pb-3">
          🌸 花のデザイン（強みの庭）
        </h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6">
          {FLOWER_PATTERNS.map((p, i) => (
            <div key={p.name} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-slate-700 font-mono">F{i + 1}</span>
                <span className="text-sm text-slate-200 font-light tracking-wide">{p.name}</span>
              </div>
              <div className={`w-full aspect-square rounded-xl border flex items-center justify-center p-5 ${BG_MAP[p.color]}`}>
                {p.component}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-700 tracking-wider">VIA:</span>
                <span className="text-[10px] text-emerald-600/70 tracking-wide">{(p as any).via}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 宝石のデザイン */}
      <section className="space-y-4">
        <h2 className="text-sm font-light tracking-widest text-amber-400/70 text-center border-b border-slate-800 pb-3">
          💎 宝石のデザイン（価値観の宝庫）
        </h2>
        <p className="text-[11px] text-slate-600 text-center -mt-2">ACT VLQ 10領域対応</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6">
          {GEM_PATTERNS.map((p, i) => (
            <div key={p.name} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-slate-700 font-mono">G{i + 1}</span>
                <span className="text-sm text-slate-200 font-light tracking-wide">{p.name}</span>
              </div>
              <div className={`w-full aspect-square rounded-xl border flex items-center justify-center p-5 ${BG_MAP[p.color]}`}>
                {p.component}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-700 tracking-wider">ACT:</span>
                <span className="text-[10px] text-amber-600/70 tracking-wide">{(p as any).act}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
