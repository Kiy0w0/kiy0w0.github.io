create table if not exists steam_friends (
  id          uuid primary key default gen_random_uuid(),
  steamid     text not null unique,
  note        text not null default '',
  created_at  timestamptz not null default now()
);

alter table steam_friends enable row level security;
create policy "friends public read" on steam_friends for select using (true);
create policy "friends owner write" on steam_friends for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
