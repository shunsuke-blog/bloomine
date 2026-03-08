"use client";
import { useState, useEffect } from "react";

/**
 * Web Speech API (SpeechRecognition) を初期化し、音声→テキスト変換を行うフック。
 * 非対応ブラウザでは recognition が null になる（テキスト入力のみ可能）。
 */
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recog = new SR();
    recog.lang = "ja-JP";
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      setTranscript((prev) => prev + final);
    };
    setRecognition(recog);
  }, []);

  return { transcript, setTranscript, recognition };
}
