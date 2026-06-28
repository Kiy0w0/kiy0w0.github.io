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

create table if not exists guestbook_config (
  k text primary key,
  v text not null
);
alter table guestbook_config enable row level security;

create or replace function set_owner_reply(entry_id uuid, reply text, secret text)
returns boolean as $$
declare
  expected text;
begin
  select v into expected from guestbook_config where k = 'owner_secret';
  if expected is null or expected = '' or secret is distinct from expected then
    return false;
  end if;
  if reply is null or btrim(reply) = '' then
    update guestbook set owner_reply = null, owner_reply_at = null where id = entry_id;
  else
    update guestbook
      set owner_reply = censor_text(reply), owner_reply_at = now()
      where id = entry_id;
  end if;
  return found;
end;
$$ language plpgsql security definer;
