/**
 * レベルに応じたopacity値を返す。
 * Lv.1=25%, Lv.5≈57%, Lv.10≈97%, Lv.11以上=100%
 */
export function levelOpacity(level: number): number {
  return Math.min(0.25 + (level - 1) * 0.08, 1.0);
}

/**
 * 根拠・発掘場所の数からレベル上昇量を計算する。
 * sqrt を天井関数で丸めることで、件数が増えるほど上昇量が緩やかになる。
 */
export function calcLevelGain(evidenceCount: number): number {
  return Math.ceil(Math.sqrt(evidenceCount));
}
