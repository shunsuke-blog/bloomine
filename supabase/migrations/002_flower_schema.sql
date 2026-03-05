-- seeds_collection を flower_collection にリネーム
alter table public.seeds_collection rename to flower_collection;

-- seed_name を flower_name にリネーム
alter table public.flower_collection rename column seed_name to flower_name;

-- week_number の UNIQUE 制約を削除（花は週をまたいで蓄積するため）
alter table public.flower_collection
  drop constraint if exists seeds_collection_user_id_week_number_key;

-- level カラムを追加（何度この強みが抽出されたか）
alter table public.flower_collection
  add column if not exists level int not null default 1;

-- root_elements テーブルを作成（強みの断片：ログと花を繋ぐ）
create table if not exists public.root_elements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  flower_id  uuid not null references public.flower_collection(id) on delete cascade,
  log_id     uuid not null references public.daily_logs(id) on delete cascade,
  root       text not null,
  created_at timestamptz not null default now()
);

-- RLS を有効化
alter table public.root_elements enable row level security;

-- root_elements RLS ポリシー
create policy "users can select own roots"
  on public.root_elements for select
  using (auth.uid() = user_id);

create policy "users can insert own roots"
  on public.root_elements for insert
  with check (auth.uid() = user_id);
