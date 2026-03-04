// lib/supabase.ts
// プロジェクトルートに lib/ フォルダを作成して、このファイルを置いてください

import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================
// 型定義（データベースの型を TypeScript で安全に扱う）
// ============================================================

export type DailyLog = {
  id: string
  user_id: string
  created_at: string
  week_number: number
  transcript: string
  emotion_score: number | null
  ai_response: string | null
  is_analyzed: boolean
}

export type Seed = {
  id: string
  user_id: string
  week_number: number
  analyzed_at: string
  seed_name: string
  os_description: string | null
  logic_reflection: string | null
  environment_condition: string | null
}
