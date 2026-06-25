create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  path        text not null,
  caption     text not null default '',
  album       text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists photos_created_at_idx on photos (created_at desc);

alter table photos enable row level security;
create policy "photos meta public read" on photos for select using (true);
create policy "photos meta owner write" on photos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "photos files public read" on storage.objects for select
  using (bucket_id = 'photos');
create policy "photos files owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');
create policy "photos files owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos');
