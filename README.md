# kiy0w0.github.io

My personal site. The home page is a live Discord profile card, and on top of that there's a blog, a photography page, a Steam friends list, and a guestbook. Built with React, TypeScript and Vite, hosted on Cloudflare Pages.

The look started out from lostf1sh.github.io (minimal, dark) but I pushed it far enough that it's its own thing now. Violet instead of green, Sora for the headings, and a banner plus avatar card instead of the terminal layout.

## Pages

- `/` is the Discord card. Avatar, banner and bio come from dcdn. Live status and Spotify come from Lanyard. Both are public APIs, so if one goes down the card still renders from the other. Want it pointed at your own account? Change `USER_ID` in src/lib/discord.ts. You'll need to join the Lanyard Discord first (https://github.com/Phineas/lanyard).
- `/blog` is markdown posts, sorted into folders, each with an upload date and a draft or published flag. Published posts are public. Only I can write. Posts also get a per-page OG image, and there's an RSS feed at `/blog/rss.xml`.
- `/photography` is a photo grid. Images get resized and re-encoded in the browser before upload, which also strips EXIF and GPS, so I'm not publishing the location my phone bakes into every shot.
- `/friends` is a short, hand-picked list of Steam profiles with their online status.
- The guestbook lives on the home page, below the card. Anyone can sign it. I can like and reply to entries.

Everything except the home card is backed by Supabase. There's no server of my own for the data. The browser talks to Supabase directly, and Row Level Security makes sure only the logged-in owner can write anything. The guestbook runs on a second, separate Supabase project so public writes can't reach anything else. The Steam page is the one real exception. It needs a small serverless function so the API key stays off the client (more on that below).

## Setup

You'll need a free Supabase project (two if you want the guestbook).

1. Make a project at supabase.com.
2. In the SQL editor, run these in order: db/schema.sql, db/schema-cover.sql, db/schema-photography.sql, db/schema-friends.sql. They create the tables, the photo storage bucket, and the RLS policies.
3. For the guestbook, make a second project and run db/schema-guestbook.sql in it. Keeping it isolated means a spammer can only ever touch the guestbook table.
4. Authentication, then Users, then Add user. That email and password is the owner login. There's deliberately no sign-up form on the site. Make exactly one user. Anyone with an account is treated as the owner.
5. Settings, then API: grab the project URL and the anon key.
6. Copy .env.example to .env and fill it in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
STEAM_API_KEY=...                       # only for /friends
VITE_GUESTBOOK_SUPABASE_URL=...         # only for the guestbook
VITE_GUESTBOOK_SUPABASE_ANON_KEY=...    # only for the guestbook
```

The anon key is meant to be public. It can only do what RLS lets it. Don't put the service_role key anywhere near the client.

### Steam (skip if you don't want /friends)

Grab a key from https://steamcommunity.com/dev/apikey. It's a secret, so it goes in STEAM_API_KEY (note: no VITE_ prefix) and is only ever read by the Steam proxy function, which runs on the server. The page calls `/api/steam`, never Steam directly, which also sidesteps the fact that Steam sends no CORS headers. Responses are cached at the CDN for about ten minutes so the API isn't hit on every visit. Online status only shows for friends whose Steam profile is public. Private ones read as offline.

## Develop

```
npm install
npm run dev      # localhost:5173
npm run build    # tsc + vite build, output to dist/
npm run test     # vitest
```

One gotcha: `npm run dev` is plain Vite, so it doesn't run the serverless functions. The friends page will error locally, and the OG, RSS and sitemap routes won't exist. If you need to test those, run `npx wrangler pages dev dist` after a build. Blog, photography and guestbook all work fine under normal dev.

## Deploy

Works on either Cloudflare Pages or Vercel. The Steam proxy ships in both formats (functions/api/steam.js for Cloudflare, api/steam.js for Vercel) and only the host's own one runs, so they don't clash. The OG, RSS, sitemap and robots routes are Cloudflare Pages Functions, so those are Cloudflare-only.

### Cloudflare Pages

Create a Pages project from the repo. Build command `npm run build`, output directory `dist`. Add the env vars under Settings, then Environment variables. The VITE_ ones are needed at build time, STEAM_API_KEY at runtime for the function. SPA routing comes from public/_redirects, and the functions in functions/ are picked up as Pages Functions automatically. To test the functions locally, run `npx wrangler pages dev dist` after a build. Plain `npm run dev` won't run them.

### Vercel

Import the repo on vercel.com and it picks up Vite by itself. Add the env vars from .env under Project, then Settings, then Environment Variables (include STEAM_API_KEY if you use friends), then deploy. Note that only the Steam proxy works on Vercel. The OG, RSS and sitemap routes are written as Cloudflare functions and won't run there.

## License

The code is MIT, see LICENSE. Take it, learn from it, build your own. That covers the code only. The content (blog posts, photos, and my name and branding) is © kiy0w0, all rights reserved, and is not part of the MIT grant. Reuse the implementation, not my identity.
