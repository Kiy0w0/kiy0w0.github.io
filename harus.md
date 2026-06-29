# harus — ngayon backlog

## done
- [x] blog (Supabase, markdown)
- [x] photography
- [x] friends (Steam)
- [x] guestbook
- [x] meta per-page + OG share
- [x] 404 page
- [x] living accent
- [x] Discord listening (non-Spotify)
- [x] OG image static pages (satori)
- [x] RSS feed `/blog/rss.xml`
- [x] sitemap.xml + robots.txt
- [x] view counter per post (needs Supabase SQL run)
- [x] folders = real folders (grid + drill-in, not category chips)
- [x] code syntax highlight (highlight.js + marked-highlight, github-dark)
- [x] blog search (filter list by title/excerpt)
- [x] bundle split (lazy-load routes)
- [x] lazy-load photos (already had loading="lazy")
- [x] uptime counter "coding since" (HomeStatus.tsx, set CODING_SINCE)
- [x] local time + weather Bali (Open-Meteo no-key, WITA)
- [x] guestbook likes — user ♥ count + owner "♥ Liked by luraph" (SQL: like_entry + set_owner_liked RPC security definer)
- [x] home featured "Latest blog" — owner pilih max 3 post, kartu PostRow (SQL: home_featured table)
- [x] fix embed Discord — satori process-shim + og:url (deploy gagal bikin SEMUA function gak publish)
- [x] image storage → **Cloudinary** (photography + blog cover). client unsigned upload preset `ngayon_unsigned`, signed destroy via CF Function `/api/cloudinary-delete`. transform helper `cldUrl()` + `photoThumb/photoFull` (f_auto,q_auto). existing Supabase Storage rows masih jalan (fallback ke `p.url` kalo `public_id` null). SQL: `alter table photos add column if not exists public_id text;`

## next (pick 1-by-1)
- [ ] reading time + scroll progress bar (BlogPost)
- [ ] tags/categories (filter posts)
- [ ] dark/light toggle

## blog ideas
- [ ] blog post prev/next nav
- [ ] copy-link button per post
- [ ] view-count sort ("popular")
- [ ] webmentions / comments
- [ ] now page (currently doing)
- [ ] image lightbox di blog post (klik gambar markdown → zoom)
- [ ] share buttons per post (twitter/copy/discord)
- [ ] "back to top" button blog post panjang
- [ ] blog post series — link beberapa post jadi seri (part 1/2/3)
- [ ] blog draft preview link — share draft sebelum publish (token URL)
- [ ] featured post pin di blog list (bukan cuma home)

## home (/) ideas
- [ ] social links row (github/twitter icons under tagline)
- [ ] tech stack / skills strip (mono badges)
- [ ] recent Steam game / playtime di home
- [ ] guestbook count / latest entry preview di hero
- [ ] view counter total site (Supabase)
- [ ] keyboard hint buat CommandPalette (kbd ⌘K)
- [ ] pinned projects / repos (github API, top 3)

## keren / web3 / api ideas
- [ ] ENS / wallet connect — .eth name + ETH balance (wagmi/viem)
- [ ] sign guestbook with wallet (SIWE)
- [ ] NFT showcase (Alchemy/OpenSea API)
- [ ] crypto ticker ETH/BTC live (CoinGecko, no-key)
- [ ] github contribution graph di home
- [ ] wakatime coding stats (bahasa + jam minggu ini)
- [ ] AI chat widget — tanya soal aku, jawab dari bio (Claude API)
- [ ] terminal mode — homepage ala CLI (help/about/blog)
- [ ] live visitor count (supabase realtime)
- [ ] qr code share ke halaman
- [ ] og link preview unfurl di blog (microlink API)
- [ ] 3d avatar / model (spline / three.js)
- [ ] spotify "top tracks" bulan ini (Spotify API)
- [x] guestbook reactions — emoji/like tiap entry
- [ ] webring / blogroll (web 1.0 revival)
- [ ] rss reader mini di /reading
- [ ] dynamic favicon ikut status discord (online/idle/dnd)
- [ ] page transition animations (view transitions API)
- [ ] command palette actions — copy email, toggle theme, go-to dari ⌘K

## portfolio section (mau bikin — pilih)
style:
- [ ] bento grid — kotak beda ukuran, featured gede (vibe Vercel/Linear)
- [ ] terminal/code cards — kartu mono, git clone + stack badges (cocok tema discord/dev)
- [ ] minimal list — judul + 1-liner + link, hover reveal (selaras blog list)
isi per project:
- [ ] judul + 1-liner desc
- [ ] stack badges (React/TS/dll, mono chip)
- [ ] live demo + github link
- [ ] thumbnail/cover image
- [ ] tahun + status (active/archived/wip)
- [ ] star count auto (github API)
data source (pilih 1):
- [ ] github API — pinned repos / top by stars, auto-update no maintenance
- [ ] supabase table — kurasi manual + custom thumbnail (kayak home_featured)
- [ ] hybrid — github API tarik repo, supabase override thumbnail/urutan

## home background (mau bikin — pilih, skrg pure black #000)
subtle (rekomendasi, perf aman):
- [ ] gradient mesh halus — accent pink radial di pojok, gelap ke tengah
- [ ] noise/grain overlay — texture film, black gak flat (1 svg/png)
- [ ] dot/grid pattern — titik mono samar, vibe dev tools
animated (cek perf):
- [ ] aurora/gradient blob — blob pink-purple blur gede gerak pelan
- [ ] breathing gradient ikut musik — extend living accent jadi bg
- [ ] starfield/particles — bintang pelan (risk: berat/norak)
- [ ] interactive — gradient ngikut cursor (mouse-follow glow)

## /portfolio (kosong — isi)
wajib (MVP, CF Pages friendly):
- [ ] route `/portfolio` + nav link + meta/OG
- [ ] data source: **supabase table `projects`** (kurasi manual, kontrol penuh) — kolom: id, slug, title, tagline, stack[], year, status, repo_url, demo_url, cover_url, featured, order_index, created_at
- [ ] layout: **bento grid** (featured 2-col span, rest 1-col) — vibe Linear/Vercel, mono, no heavy lib
- [ ] kartu: cover (lazy, aspect-video), title, 1-liner, stack chips, year+status dot, repo+demo ikon
- [ ] empty state + skeleton loader (samain pattern blog list)
- [ ] detail page `/portfolio/:slug` — markdown body (reuse marked + highlight.js dari blog), screenshot gallery, problem/solution/stack/learnings, link demo+repo
- [ ] OG image dinamis per project (reuse satori function, route `/og/portfolio/:slug`)

keren tapi ringan (pilih):
- [ ] **github star count auto** — fetch sekali per project di CF Pages Function, cache 1 jam KV (no client API hit, no rate limit)
- [ ] **last commit relative time** — "updated 3d ago" via github API + KV cache
- [ ] tech stack icons (simple-icons svg inline, no font/lib)
- [ ] filter chip by stack (React/TS/Go/dll) — client-side, no reload
- [ ] sort: featured → year desc → manual order
- [ ] hover: cover scale + accent border (CSS only, gak js)
- [ ] WIP badge animasi titik (pulse, CSS keyframe)
- [ ] view-count per project (reuse pattern view-counter blog)

skip (berat / overkill):
- ~~3d preview / spline embed~~ (berat, gak fit minimal)
- ~~live iframe demo~~ (CSP+perf nightmare)
- ~~video autoplay cover~~ (bandwidth, sama vibe ama bg video toggle)

## /tools (kosong — isi, mini-utility kayak ray.so / tiny-tools)
konsep: kumpulan tool kecil yang **kepake sendiri**, full client-side, no backend (CF Pages static OK). tiap tool route sendiri `/tools/:slug`, index `/tools` grid.

wajib (MVP):
- [ ] route `/tools` index + nav link + meta
- [ ] grid kartu tool (ikon + nama + 1-liner)
- [ ] layout konsisten per tool (header + body + "copy result" pattern)
- [ ] semua **client-side only** (no API key, no backend) biar CF Pages aman + gratis

tool ringan (pilih, semua sub-10kb logic):
- [ ] **json formatter / minifier** — paste → pretty/min, copy, error line highlight
- [ ] **base64 encode/decode** — text ↔ base64, file → base64 data URI
- [ ] **uuid generator** — v4 + v7, bulk (1/10/100), copy
- [ ] **jwt decoder** — paste token → header/payload/sig (decode only, no verify, client-side)
- [ ] **url encode/decode** + query string parser (table view)
- [ ] **timestamp converter** — unix ↔ ISO ↔ relative, timezone (WITA default)
- [ ] **regex tester** — pattern + flags + test string, highlight match group
- [ ] **markdown → html preview** (reuse marked dari blog) + copy html
- [ ] **color picker / converter** — hex ↔ rgb ↔ hsl ↔ oklch, contrast checker WCAG
- [ ] **gradient generator** — 2-3 stop, copy CSS / Tailwind
- [ ] **case converter** — camel/snake/kebab/pascal/CONST
- [ ] **lorem ipsum generator** — paragraph/word/sentence count
- [ ] **qr generator** — text/url → QR (qrcode lib ~5kb), download png/svg
- [ ] **password generator** — length + char class, entropy meter, crypto.getRandomValues
- [ ] **hash generator** — md5/sha1/sha256/sha512 (SubtleCrypto native, no lib)
- [ ] **diff viewer** — paste 2 text → side-by-side diff (diff lib ringan)
- [ ] **image compressor** — drop png/jpg → resize+quality, download (canvas only, no upload)
- [ ] **svg minifier / viewer** — paste SVG → preview + minified output
- [ ] **cron expression explainer** — "0 9 * * 1-5" → "weekdays 9am" + next 5 fires

keren bonus (kalo sempet):
- [ ] keyboard shortcut tiap tool (⌘+Enter run, ⌘+C copy result)
- [ ] history per tool (localStorage 10 last input)
- [ ] share link (state encoded di URL hash, no server)
- [ ] dark/light per tool (selaras global theme toggle nanti)
- [ ] command palette ⌘K integrate — search tool langsung

skip (perlu backend / berat):
- ~~screenshot website~~ (perlu headless, mahal)
- ~~pdf tools~~ (lib gede, 1mb+)
- ~~AI tools~~ (perlu API key, biaya)
- ~~video converter~~ (ffmpeg.wasm 30mb+, gak fit)

## image storage — supabase bakal penuh (saran)
masalah: Supabase free = 1GB storage + 5GB egress/bulan. Photography full-res + blog cover bakal cepat habis. Pilih salah satu, semua CF Pages friendly.


## saran baru
- [ ] guestbook owner reply — balas entry, nested di bawah pesan
- [ ] guestbook anti-spam — rate limit per IP / honeypot field
- [ ] og image cache — simpan png ke KV/R2 biar gak regen tiap hit
- [ ] sitemap auto-ping google/bing tiap publish post
- [ ] analytics ringan — plausible/umami self-host, privacy-first

## audit halaman (gap konkret — pilih)

### home (/) — yang kurang
- [ ] **social links row** — github/twitter/email ikon bawah tagline. PENTING: tagline klaim "open source projects" tapi link github gak ada sama sekali
- [ ] **nav terlihat** — /blog /photography /friends skrg cuma via ⌘K (hidden). Tambah baris link / kbd hint ⌘K biar ketemu
- [ ] scroll cue hero→guestbook (panah/teks samar, guestbook ketutup di bawah fold)
- [ ] tech stack strip — mono badge React/TS/dll
- [ ] meta deskripsi home sebut blog+photo+steam tapi gak ada link langsung ke situ

### guestbook — yang kurang
- [ ] **owner delete entry** — owner bisa like tapi GAK bisa hapus, spam gak bisa diberesin
- [ ] char counter textarea (maxLength 280 tanpa feedback)
- [ ] relative time ("2h ago") selain timestamp penuh
- [ ] "load more" / paginate — skrg render SEMUA entry sekaligus
- [ ] simpan nama di localStorage (gak ketik ulang tiap kirim)
- [ ] honeypot field anti-bot (lihat anti-spam di atas)

### guestbook — ui/ux & looks (saran cemerlang)
hierarchy & layout:
- [ ] **2-col → 1-col mobile collapse** — skrg `.gb-cols` 2-col, di mobile pasti rapet. Stack vertical < 720px, form di atas, list scroll di bawah
- [ ] **sticky form panel desktop** — kolom kiri (form) `position: sticky; top: 1rem` biar scroll list panjang, form tetep keliatan
- [ ] **entry card variant** — entry yang di-owner-like dikasih border accent gradient halus + subtle glow (highlight pesan favorit owner)
- [ ] **owner reply visual** — kotak reply skrg flat. Kasih bg `var(--surface-2)` + border-left 2px accent + avatar bulat 28px (kayak Discord reply), bukan rectangle datar
- [ ] **divider antar entry** — skrg cuma gap, tambah hairline `border-top: 1px solid var(--border)` opacity 0.4 biar visual rhythm jelas

micro-interactions (CSS only, ringan):
- [ ] **heart pop animation** — klik ♥ → scale(1.4) → 1 + burst partikel kecil (3-5 dot pink fade), keyframe 400ms
- [ ] **entry enter animation** — fade-in + translateY(-8px) waktu submit baru, IntersectionObserver pas scroll (sama pattern `.reveal`)
- [ ] **send button magnetic** — hover: pulse halus + arrow → geser kanan 2px, active: scale(0.96)
- [ ] **char counter ring** — bukan "120/280" plain, tapi SVG ring di pojok textarea yang ngisi pas ngetik (last 20 char warna kuning, last 10 merah)
- [ ] **typing indicator owner** — kalo owner lagi reply, entry yang lain dim 0.6 opacity (fokus visual)

personality / detail:
- [ ] **owner badge crown** — `Liked by luraph` ganti badge bulat dengan ikon (♥ pink filled) + nama, lebih playful
- [ ] **emoji reaction row** — 5 emoji preset (❤️🔥👀✨😂) di bawah pesan, hover reveal, klik counter naik (extend reactions yg udah ✓)
- [ ] **first-letter avatar** — kalo gak ada pfp, generate avatar bulat huruf pertama nama + bg color hash dari nama (deterministic, no API)
- [ ] **easter egg konami** — ↑↑↓↓←→←→BA → rain emoji ♥ di guestbook section
- [ ] **owner pesan placeholder rotate** — "say something...", "drop a line", "yell into the void", "leave a hi", rotate tiap mount

empty / loading state:
- [x] **skeleton entry** — 3 ghost card shimmer (gb-skel di [Guestbook.tsx](src/components/Guestbook.tsx))
- [ ] **empty state ilustrasi** — "be the first to sign" + ASCII art kecil atau SVG mono (kursor blink, paper plane)
- [ ] **success toast** — abis submit, toast halus pojok kanan bawah "signed ✓" 2s fade

accessibility & polish:
- [ ] **focus ring konsisten** — semua tombol guestbook pakai `:focus-visible` outline accent 2px offset 2px (skrg bawaan browser)
- [ ] **textarea auto-grow** — height ngikut konten (max 8 rows) drpd fixed 4 rows
- [ ] **send button disabled state visual** — skrg cuma `disabled`, kasih opacity 0.4 + cursor not-allowed + tooltip "isi nama & pesan dulu"
- [ ] **time hover detail** — relative time hover → tooltip absolute time (best of both)
- [ ] **link auto-detect di pesan** — `http(s)://` di message render `<a>` (dengan `rel="noreferrer nofollow ugc"` biar aman SEO)

### photography — yang kurang
- [x] **lightbox bener** — close btn, esc, arrow kiri/kanan, caption, klik gambar gak nutup
- [x] esc + arrow key buat lightbox (keyboard nav)
- [x] caption + tanggal di dalam lightbox
- [x] tombol open original
- [ ] count per album di chip (mis. "travel 12")
- [ ] upload progress + drag-drop (owner)


## kuromi / sanrio theme (domain kuromi.foo — vibe)
identitas visual (pilih, jangan norak):
- [ ] accent palette → kuromi: ungu gelap #2b1840 + pink #ff7eb6 + hitam. living accent ikut
- [ ] cursor custom — kuromi/skull kecil (svg, fallback default)
- [ ] favicon kuromi face + dynamic ikut discord status (rekuse ide dynamic favicon)
- [ ] selection color pink, scrollbar ungu tipis
- [ ] 404 page → kuromi pout art + "lost in the dark"
- [ ] loading spinner skull/bow kecil ganti "loading…"
- [ ] hover sfx — bow/skull samar di pojok kartu
detail playful (ringan, css/svg only):
- [ ] konami easter egg → kuromi rain (extend ide guestbook)
- [ ] cmdk panick.gif → kuromi reaction
- [ ] footer "made w/ 🖤 by luraph" + kuromi mini
- [ ] guestbook avatar default → kuromi/sanrio random
- [ ] secret /melody atau /mymelody — mode pink balik kuromi (theme swap easter egg)
skip (norak/berat): glitter gif, midi autoplay, comic sans, animated bg sanrio penuh

nama website ku kuromi.foo
kemungkinan aku bakal ngebuat paste.kuromi.foo
apa fungsinya:
1. bisa membuat pastebin untuk pribadi atau untuk orang orang dan tanpa login, secara anonim
2. bisa di buat 1x lihat  atau di settings berapa lama mau dihapus automatis max 2 minggu
3. fitur 1x lihat bakal muncul popup, peringatan cuman bisa di lihat 1x saat pencet tombol oke akan muncul paste bin nya. namun pas orang itu refresh atau tutup pastebin akan hilang.