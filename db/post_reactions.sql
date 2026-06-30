-- Blog post emoji reactions (run in MAIN supabase project hzzzzavynqwdlcmfyxaa)

create table if not exists post_reactions (
  slug text not null,
  emoji text not null,
  count int not null default 0,
  primary key (slug, emoji)
);

alter table post_reactions enable row level security;

drop policy if exists "reactions read" on post_reactions;
create policy "reactions read" on post_reactions for select using (true);

create or replace function react_to_post(post_slug text, react_emoji text, delta int)
returns void as $$
begin
  if react_emoji is null or length(react_emoji) = 0 or length(react_emoji) > 16 then
    return;
  end if;
  if delta not in (-1, 1) then
    return;
  end if;
  insert into post_reactions (slug, emoji, count)
    values (post_slug, react_emoji, greatest(0, delta))
  on conflict (slug, emoji)
    do update set count = greatest(0, post_reactions.count + delta);
end;
$$ language plpgsql security definer;

grant execute on function react_to_post(text, text, int) to anon;
