
create table if not exists folders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);


create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  excerpt     text not null default '',
  body        text not null default '',
  folder_id   uuid references folders(id) on delete set null,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists posts_created_at_idx on posts (created_at desc);
create index if not exists posts_folder_idx on posts (folder_id);


alter table folders enable row level security;
alter table posts   enable row level security;


create policy "folders public read"   on folders for select using (true);
create policy "folders owner write"   on folders for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "posts public read published" on posts for select
  using (published = true);
create policy "posts owner read all" on posts for select
  using (auth.role() = 'authenticated');
create policy "posts owner write" on posts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
