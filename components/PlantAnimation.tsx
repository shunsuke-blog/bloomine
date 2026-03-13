"use client";
import { motion, AnimatePresence, type MotionValue, useTransform } from "framer-motion";

export type PlantStage =
  | "soil"       // day 0
  | "emergence"  // day 1 — 芽が土を突き破る
  | "sprout"     // day 2 — 双葉が開く前の一本芽
  | "seedling"   // day 3 — 双葉 + 小さな蕾
  | "young"      // day 4 — 背が伸び葉が広がる
  | "grown"      // day 5 — 4枚の葉 + 蕾が膨らむ
  | "bud"        // day 6 — 大きな蕾 + 萼
  | "preflower"  // day 7 — 蕾がほころび始める（ピンクがわずかに覗く）
  | "flower";    // 分析後 — 満開

export function getPlantStage(count: number): PlantStage {
  if (count >= 7) return "preflower";
  if (count >= 6) return "bud";
  if (count >= 5) return "grown";
  if (count >= 4) return "young";
  if (count >= 3) return "seedling";
  if (count >= 2) return "sprout";
  if (count >= 1) return "emergence";
  return "soil";
}

// ─── カラーパレット ───
const C = {
  soilFill:   "#1e293b",
  soilStroke: "#334155",
  stem:       "#34d399",
  leaf:       "#34d399",
  leafFill:   "#064e3b",
  bud:        "#6ee7b7",
  budFill:    "#065f46",
} as const;

// ─── 花専用カラー（ローズ系） ───
const FC = {
  petal:     "#fda4af",
  petalFill: "#4c0519",
  center:    "#fb7185",
  glow:      "#fda4af",
} as const;

// ─── 共通 props ───
const stemP = { stroke: C.stem, strokeWidth: 1.5, fill: "none", strokeLinecap: "round" as const };
const leafP  = { stroke: C.leaf, strokeWidth: 1.5, fill: C.leafFill };
const leafPs = { stroke: C.leaf, strokeWidth: 1.2, fill: C.leafFill };

// ─── 土台 ───
function Soil() {
  return (
    <ellipse cx="60" cy="145" rx="40" ry="11"
      fill={C.soilFill} stroke={C.soilStroke} strokeWidth="1.5" />
  );
}

function SoilGlow({ volume }: { volume: MotionValue<number> }) {
  const opacity = useTransform(volume, [0, 0.2], [0, 0.88]);
  return (
    <>
      <defs>
        <filter id="soil-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <motion.ellipse
        cx="60" cy="148" rx="72" ry="24"
        fill="#6ee7b7"
        filter="url(#soil-blur)"
        style={{ opacity }}
      />
      <ellipse cx="60" cy="145" rx="40" ry="11"
        fill={C.soilFill} stroke={C.soilStroke} strokeWidth="1.5" />
    </>
  );
}

// ─── 葉（共通パーツ） ───
function LeavesLow() {
  return (
    <>
      <path d="M61,118 Q40,107 45,127 Q54,124 61,118" {...leafP} />
      <path d="M61,118 Q82,107 77,127 Q68,124 61,118" {...leafP} />
    </>
  );
}
function LeavesHigh() {
  return (
    <>
      <path d="M62,98 Q47,90 50,105 Q57,103 62,98" {...leafPs} />
      <path d="M62,98 Q77,90 74,105 Q67,103 62,98" {...leafPs} />
    </>
  );
}

// ─── Day 1: Emergence — 芽が土を突き破る ───
function Emergence() {
  return (
    <>
      {/* 土からわずかに顔を出す茎 */}
      <path d="M60,138 L60,131" {...stemP} strokeWidth={1.3} />
      {/* 丸い芽先 */}
      <circle cx="60" cy="129" r="2.5"
        fill={C.budFill} stroke={C.bud} strokeWidth="1.2" />
    </>
  );
}

// ─── Day 2: Sprout — 一本の短い芽 ───
function Sprout() {
  return (
    <>
      <path d="M60,136 Q61,130 60,122" {...stemP} />
      {/* やや大きな丸い芽先 */}
      <circle cx="60" cy="120" r="3.5"
        fill={C.budFill} stroke={C.bud} strokeWidth="1.3" />
    </>
  );
}

// ─── Day 3: Seedling — 双葉 + 小蕾 ───
function Seedling() {
  return (
    <>
      <path d="M60,136 Q62,125 60,110" {...stemP} />
      {/* 小さな双葉 */}
      <path d="M60,120 Q50,115 52,125 Q56,122 60,120"
        stroke={C.leaf} strokeWidth="1.2" fill={C.leafFill} />
      <path d="M60,120 Q70,115 68,125 Q64,122 60,120"
        stroke={C.leaf} strokeWidth="1.2" fill={C.leafFill} />
      {/* 小さな蕾 */}
      <path d="M60,110 Q64,102 60,99 Q56,102 60,110"
        stroke={C.bud} strokeWidth="1.2" fill={C.budFill} />
    </>
  );
}

// ─── Day 4: Young — 中くらいの高さ、葉が育つ ───
function Young() {
  return (
    <>
      <path d="M60,136 Q63,117 61,94" {...stemP} />
      {/* 中くらいの葉（一対） */}
      <path d="M61,116 Q47,108 50,122 Q56,119 61,116" {...leafPs} />
      <path d="M61,116 Q75,108 72,122 Q66,119 61,116" {...leafPs} />
      {/* 育ちつつある蕾 */}
      <path d="M61,94 Q67,85 61,80 Q55,85 61,94"
        stroke={C.bud} strokeWidth="1.4" fill={C.budFill} />
    </>
  );
}

// ─── Day 5: Grown — 4枚葉 + 蕾が膨らむ ───
function Grown() {
  return (
    <>
      <path d="M60,136 Q65,112 62,76" {...stemP} />
      <LeavesLow />
      <LeavesHigh />
      <path d="M62,76 Q68,66 62,61 Q56,66 62,76"
        stroke={C.bud} strokeWidth="1.5" fill={C.budFill} />
    </>
  );
}

// ─── Day 6: Bud — 大きな蕾 + 萼 ───
function Bud() {
  return (
    <>
      <path d="M60,136 Q65,108 63,68" {...stemP} />
      <LeavesLow />
      <LeavesHigh />
      <path d="M63,68 Q72,55 63,48 Q54,55 63,68"
        stroke={C.bud} strokeWidth="1.8" fill={C.budFill} />
      <path d="M63,65 Q56,60 58,52" stroke={C.leaf} strokeWidth="1" fill="none" />
      <path d="M63,65 Q70,60 68,52" stroke={C.leaf} strokeWidth="1" fill="none" />
    </>
  );
}

// ─── Day 7: PreFlower — 蕾がほころび、ピンクが覗く ───
function PreFlower() {
  return (
    <>
      <path d="M60,136 Q65,108 63,68" {...stemP} />
      <LeavesLow />
      <LeavesHigh />
      {/* 少し横に広がった蕾 */}
      <path d="M63,68 Q74,54 63,46 Q52,54 63,68"
        stroke={C.bud} strokeWidth="1.8" fill={C.budFill} />
      {/* 萼 */}
      <path d="M63,65 Q56,60 58,52" stroke={C.leaf} strokeWidth="1" fill="none" />
      <path d="M63,65 Q70,60 68,52" stroke={C.leaf} strokeWidth="1" fill="none" />
      {/* 蕾の先端からわずかにピンクの花びらが顔を出す */}
      <path d="M58,49 Q60,43 63,46 Q66,43 68,49"
        stroke={FC.petal} strokeWidth="1.3" fill={FC.petalFill} />
    </>
  );
}

// ─── 分析後: Flower — 満開 ───
const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

function Flower() {
  return (
    <>
      <path d="M60,136 Q65,108 63,68" {...stemP} />
      <LeavesLow />
      <LeavesHigh />
      {/* 花びら 6枚 */}
      {PETAL_ANGLES.map((deg) => (
        <ellipse key={deg}
          cx="63" cy="44" rx="5" ry="10"
          fill={FC.petalFill} stroke={FC.petal} strokeWidth="1.2"
          transform={`rotate(${deg}, 63, 56)`}
        />
      ))}
      {/* 花の中心 */}
      <circle cx="63" cy="56" r="6" fill={FC.center} stroke={FC.glow} strokeWidth="1" />
    </>
  );
}

// ─── ステージ → コンテンツのマッピング ───
const STAGE_CONTENT: Record<PlantStage, React.ReactNode> = {
  soil:      null,
  emergence: <Emergence />,
  sprout:    <Sprout />,
  seedling:  <Seedling />,
  young:     <Young />,
  grown:     <Grown />,
  bud:       <Bud />,
  preflower: <PreFlower />,
  flower:    <Flower />,
};

// ─── メインコンポーネント ───
const variants = {
  initial: { opacity: 0, y: 6, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -4, scale: 0.97 },
};

export function PlantAnimation({
  stage,
  volume,
}: {
  stage: PlantStage;
  volume?: MotionValue<number>;
}) {
  return (
    <svg viewBox="0 0 120 160" width="120" height="160"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      {volume ? <SoilGlow volume={volume} /> : <Soil />}
      <AnimatePresence mode="wait">
        <motion.g
          key={stage}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {STAGE_CONTENT[stage]}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
