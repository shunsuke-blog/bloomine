alter table public.daily_logs
  add column if not exists prompt_id text;
