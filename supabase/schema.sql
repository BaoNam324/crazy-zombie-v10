-- Crazy Zombie 10.0 — Supabase Postgres Schema (Cloud Save & Endless Corridor Leaderboard)
create table if not exists public.player_saves (
  id uuid primary key default gen_random_uuid(),
  player_name text not null unique,
  unlocked_chapters int not null default 1,
  unlocked_heroes text[] not null default array['ichigo','goku','iori','zero','asuna','zoro','gojo'],
  cursed_arcades_cleared int not null default 0,
  true_ending_unlocked boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.tower_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  hero_id text not null,
  floor_reached int not null,
  max_combo int not null default 0,
  score bigint not null default 0,
  mystic_ordeal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_tower_score on public.tower_leaderboard (score desc, floor_reached desc);

alter table public.player_saves enable row level security;
alter table public.tower_leaderboard enable row level security;

create policy "Public read leaderboard" on public.tower_leaderboard for select using (true);
create policy "Public insert leaderboard" on public.tower_leaderboard for insert with check (true);
