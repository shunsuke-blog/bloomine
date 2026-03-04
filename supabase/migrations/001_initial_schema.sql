-- daily_logs テーブル
create table if not exists public.daily_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  week_number   int not null,
  transcript    text not null,
  emotion_score int check (emotion_score between 1 and 10),
  ai_response   text,
  is_analyzed   boolean not null default false
);

-- seeds_collection テーブル（一期一会の原則 = week_number はユーザー毎に1回のみ）
create table if not exists public.seeds_collection (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  week_number           int not null,
  analyzed_at           timestamptz not null default now(),
  seed_name             text not null,
  os_description        text,
  logic_reflection      text,
  environment_condition text,
  unique (user_id, week_number)
);

-- RLS を有効化
alter table public.daily_logs enable row level security;
alter table public.seeds_collection enable row level security;

-- daily_logs RLS ポリシー
create policy "users can select own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "users can insert own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "users can update own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

-- seeds_collection RLS ポリシー
create policy "users can select own seeds"
  on public.seeds_collection for select
  using (auth.uid() = user_id);

create policy "users can insert own seeds"
  on public.seeds_collection for insert
  with check (auth.uid() = user_id);
