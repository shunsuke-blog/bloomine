-- 価値観コレクション（宝物）テーブル
CREATE TABLE IF NOT EXISTS public.treasure_collection (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analyzed_at   timestamptz DEFAULT now(),
  treasure_name text        NOT NULL,
  description   text,
  keywords      text[],
  level         int         NOT NULL DEFAULT 1,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.treasure_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own treasures"
  ON public.treasure_collection
  FOR ALL
  USING (auth.uid() = user_id);

-- 発掘場所テーブル（dig_sites: root_elements の価値観版）
CREATE TABLE IF NOT EXISTS public.dig_sites (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  treasure_id uuid        REFERENCES public.treasure_collection(id) ON DELETE CASCADE NOT NULL,
  log_id      uuid        REFERENCES public.daily_logs(id) ON DELETE SET NULL,
  site        text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.dig_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dig_sites"
  ON public.dig_sites
  FOR ALL
  USING (auth.uid() = user_id);
