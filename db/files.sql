-- chaewon.kuromi.foo file host mapping (run in MAIN supabase project hzzzzavynqwdlcmfyxaa)

create table if not exists files (
  slug text primary key,
  ik_url text not null,
  ik_file_id text,
  content_type text,
  size int,
  created_at timestamptz not null default now()
);

alter table files enable row level security;

drop policy if exists "files read" on files;
create policy "files read" on files for select using (true);

drop policy if exists "files insert" on files;
create policy "files insert" on files for insert to authenticated with check (true);

drop policy if exists "files delete" on files;
create policy "files delete" on files for delete to authenticated using (true);
