"use client";
import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * マイク音量をリアルタイムで追跡し、Framer Motion の smoothVolume を返すフック。
 * start() でマイク取得 + RAF ループ開始、stop() でリソース解放。
 */
export function useVolumeTracker() {
  const rawVolume = useMotionValue(0);
  const smoothVolume = useSpring(rawVolume, { damping: 18, stiffness: 200 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number | null>(null);

  // アンマウント時に自動解放
  useEffect(() => {
    return () => { stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** マイクを取得して音量トラッキングを開始。成功なら true を返す。 */
  const start = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      let lastTick = 0;
      const tick = (ts: number) => {
        if (!analyserRef.current) return; // stop() 呼び出し済み → ループ終了
        if (ts - lastTick >= 100) {        // ~10fps にスロットル
          lastTick = ts;
          analyserRef.current.getByteFrequencyData(data);
          const avg = data.reduce((sum, v) => sum + v, 0) / (data.length * 255);
          rawVolume.set(avg);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return true;
    } catch {
      return false;
    }
  };

  /** トラッキングを停止し、全リソースを解放する。 */
  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current   = null;
    rawVolume.set(0);
  };

  return { smoothVolume, start, stop };
}
