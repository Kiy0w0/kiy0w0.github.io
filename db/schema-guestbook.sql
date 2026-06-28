-- Guestbook — runs in the SEPARATE guestbook Supabase project (not the main one).
-- Public can read and insert; nobody can edit or delete from the client (you
-- moderate by deleting rows in the dashboard). A trigger censors bad words on
-- insert, so it can't be bypassed by hitting the API directly.

create table if not exists guestbook (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists guestbook_created_at_idx on guestbook (created_at desc);

-- Server-side censor (keep the word list in sync with src/lib/censor.ts).
create or replace function censor_text(t text) returns text as $$
  select regexp_replace(
    t,
    '\m(fuck|fucking|shit|bitch|asshole|bastard|dick|cunt|pussy|slut|whore|nigger|nigga|faggot|retard|cock|motherfucker|wtf|stfu|anjing|anjg|anjir|bangsat|babi|kontol|memek|ngentot|entot|pepek|tai|tolol|goblok|kampret|bajingan|pelacur|jancok|jancuk|asu|pantek|puki|ngewe|colmek|kimak|bgst|bego)\M',
    '***',
    'gi'
  );
$$ language sql immutable;

create or replace function guestbook_censor() returns trigger as $$
begin
  new.name := censor_text(new.name);
  new.message := censor_text(new.message);
  return new;
end;
$$ language plpgsql;

drop trigger if exists guestbook_censor_trg on guestbook;
create trigger guestbook_censor_trg
  before insert on guestbook
  for each row execute function guestbook_censor();

alter table guestbook enable row level security;

create policy "guestbook public read" on guestbook for select using (true);

-- Insert only, with length guards baked into the policy.
create policy "guestbook public insert" on guestbook for insert
  with check (
    char_length(name) between 1 and 40
    and char_length(message) between 1 and 280
  );

alter table guestbook add column if not exists owner_reply text;
alter table guestbook add column if not exists owner_reply_at timestamptz;

drop policy if exists "guestbook owner update" on guestbook;
create policy "guestbook owner update" on guestbook for update
  to authenticated using (true) with check (true);
