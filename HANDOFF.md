# Handoff — ngayon

Copas ini ke chat Claude baru sebagai pesan pertama.

---

Lanjutkan ngayon (personal site, React+TS+Vite, deploy Cloudflare Pages, dir `c:\Users\Kezia\Downloads\coding\ngayon`).

**Rules:**
- caveman + ponytail aktif (terse, lazy, fragments OK)
- ZERO komen hijau di file final
- Build = `npm run build` (tsc --noEmit && vite build)
- Folder `lostf1sh.github.io/` = reference, JANGAN sentuh
- JANGAN bikin wrangler.toml (lock CF env mgmt, gak reach VITE_*)
- Aku push manual ke GitHub. Kamu cuma jalanin perintah, jangan commit/push sendiri

**Baca dulu sebelum action:**
1. Memory: `ngayon-features-progress` + `ngayon-site-ambience` + `ngayon-og-satori`
2. `harus.md` di root repo (backlog 1-by-1)

**Status akhir sesi sebelumnya — DONE, BELUM commit/push:**

1. **README.md** ditulis ulang clean (no em-dash, human-like, no AI tics) — reflek Cloudflare Pages first, guestbook isolated Supabase project, OG/RSS/sitemap functions
2. **Guestbook owner reply** — owner bisa balas entry, nested di bawah pesan, pakai pfp+nama Discord live via `getProfile()`. Files: `src/lib/guestbook.ts`, `src/components/Guestbook.tsx`, `src/index.css` (`.gb-reply` styles).
   - **Akar masalah lama:** `gb` client gak login (owner login ada di project blog, beda Supabase project). Plain table UPDATE diam-diam ke-block RLS.
   - **Solusi final:** RPC `set_owner_reply(entry_id, reply, secret)` SECURITY DEFINER. Secret disimpen di `guestbook_config` table (BUKAN `current_setting` — gagal di pooler). Client baca dari `VITE_GUESTBOOK_OWNER_SECRET` env (sadar: VITE_ ke-bundle publik, cuma naikin bar dikit, sama level seperti likes existing).
3. **SiteAmbience bg toggle** — tombol baru "▦ bg on/off" di samping music toggle. Default OFF (clean black). Persist `localStorage["bg-video"]`. Video gak di-render pas OFF (hemat 28MB animebg.mp4 + CPU). Dua tombol dalam `.ambience-controls` flex container, mobile responsive `@media (max-width:480px)`.
   - **Akar bug video ilang sebelumnya:** Windows accessibility default nyalain `prefers-reduced-motion`. CSS lama punya `@media (prefers-reduced-motion) { .site-bg { display: none } }` → video disembunyiin total. SUDAH dihapus. JANGAN tambah lagi.
   - **Body bg WAJIB transparent.** `#000` fallback ada di `html` selector. Kalau body bg opaque → video z-index `-2` ketutup.
4. **harus.md** — section "audit halaman (gap konkret)" sudah ditambah (home/guestbook/photography gaps).

**SQL WAJIB jalanin di Supabase guestbook project (SQL editor), ganti `RAHASIA`:**

```sql
alter table guestbook add column if not exists owner_reply text;
alter table guestbook add column if not exists owner_reply_at timestamptz;

create table if not exists guestbook_config (k text primary key, v text not null);
alter table guestbook_config enable row level security;

create or replace function set_owner_reply(entry_id uuid, reply text, secret text)
returns boolean as $$
declare expected text;
begin
  select v into expected from guestbook_config where k = 'owner_secret';
  if expected is null or expected = '' or secret is distinct from expected then return false; end if;
  if reply is null or btrim(reply) = '' then
    update guestbook set owner_reply = null, owner_reply_at = null where id = entry_id;
  else
    update guestbook set owner_reply = censor_text(reply), owner_reply_at = now() where id = entry_id;
  end if;
  return found;
end;
$$ language plpgsql security definer;

insert into guestbook_config (k, v) values ('owner_secret', 'RAHASIA')
  on conflict (k) do update set v = excluded.v;
```

**Env (lokal `.env` + Cloudflare Pages env vars):**
```
VITE_GUESTBOOK_OWNER_SECRET=RAHASIA
```
Sama persis dgn nilai di `guestbook_config`. Restart `npm run dev` setelah nambah (Vite gak hot-reload env). Test DB cepat: `select set_owner_reply('<id-asli>', 'tes', 'RAHASIA');` → harus return `true`.

**Files diubah sesi ini (siap kamu commit manual):**
- `README.md`
- `harus.md`
- `src/components/SiteAmbience.tsx`
- `src/components/Guestbook.tsx`
- `src/lib/guestbook.ts`
- `src/index.css`
- `db/schema-guestbook.sql`
- `.env.example`

**Next dari harus.md (pilih 1 pas mulai):**
- reading time + scroll progress bar (BlogPost)
- tags/categories (filter posts)
- dark/light toggle
- portfolio section (style + data source belum diputus — bento/terminal/list × github API/supabase/hybrid)
- audit halaman gap concrete (home github link kurang, guestbook owner delete, photography lightbox bener)

Build masih green. Lanjut ke item mana?
