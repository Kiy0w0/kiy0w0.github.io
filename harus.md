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

## next (pick 1-by-1)
- [ ] reading time + scroll progress bar (BlogPost)
- [x] code syntax highlight (markdown code blocks) — highlight.js + marked-highlight, github-dark
- [x] blog search (filter list by title/excerpt) — already in BlogList
- [ ] tags/categories (filter posts)
- [ ] dark/light toggle
- [x] bundle split — client JS 520kB warning (lazy-load routes)
- [x] lazy-load photos (Photography) — already had loading="lazy"

## ideas (maybe)
- [ ] blog post prev/next nav
- [ ] copy-link button per post
- [ ] view-count sort ("popular")
- [ ] webmentions / comments
- [ ] now page (currently doing)

## home (/) ideas
- [ ] social links row (github/twitter/etc icons under tagline)
- [ ] tech stack / skills strip (mono badges)
- [ ] latest blog post teaser card (link ke /blog post terbaru)
- [x] uptime/since counter ("coding since") — live tiap detik, HomeStatus.tsx (set CODING_SINCE)
- [x] local time + weather Bali — Open-Meteo no-key, WITA time, HomeStatus.tsx
- [ ] recent Steam game / playtime (udah ada Friends, tarik 1 ke home)
- [ ] guestbook count / latest entry preview di hero
- [ ] view counter total site (Supabase)
- [ ] keyboard hint buat CommandPalette (kbd ⌘K)
- [ ] pinned projects / repos (github API, top 3)

## keren / web3 / api ideas
- [ ] ENS / wallet connect — tampil .eth name + ETH balance (wagmi/viem)
- [ ] sign guestbook with wallet (SIWE — sign-in with ethereum, no password)
- [ ] NFT showcase — tarik koleksi NFT dari wallet (Alchemy/OpenSea API)
- [ ] crypto ticker kecil — ETH/BTC price live (CoinGecko API, no-key)
- [ ] github contribution graph di home (github-contributions API / svg)
- [ ] wakatime coding stats — bahasa + jam minggu ini (wakatime API)
- [ ] AI chat widget — tanya-jawab soal aku, jawab dari bio (Claude API)
- [ ] terminal mode — homepage ala CLI, ketik command (help/about/blog)
- [ ] live visitor count — siapa online sekarang (websocket / supabase realtime)
- [ ] qr code share — generate QR ke halaman, buat tukeran kontak
- [ ] og link preview unfurl — paste link di blog auto jadi card (microlink API)
- [ ] 3d avatar / model — spline atau three.js di hero
- [ ] spotify "top tracks" bulan ini (Spotify API, bukan cuma now-playing)
- [x] guestbook reactions — emoji react tiap entry (supabase)
- [ ] webring / blogroll — link ke temen, gaya web 1.0 revival
- [ ] rss reader mini — feed blog favorit kamu di /reading
- [ ] e2e encrypted contact form — kirim pesan, cuma kamu bisa baca
- [ ] dynamic favicon — ganti sesuai status discord (online/idle/dnd)
- [ ] page transition animations (view transitions API native)
- [ ] command palette actions — copy email, toggle theme, go-to dari ⌘K
