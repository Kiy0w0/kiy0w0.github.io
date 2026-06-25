kiy0w0.github.io

My personal site. The home page is a live Discord profile card; on top of that
there's a blog, a photography page, and a Steam friends list. React +
TypeScript + Vite, hosted on Vercel.

The look started from lostf1sh.github.io (minimal, dark) but I moved it far
enough to be its own thing — violet instead of green, Sora for the headings, and
a banner + avatar card instead of the terminal layout.

## Pages

- `/` — the Discord card. Avatar, banner and bio come from dcdn; live status and
  Spotify come from Lanyard. Both are public APIs, and if one is down the card
  still renders from the other. Point it at your own account by changing
  `USER_ID` in src/lib/discord.ts (you have to join the Lanyard Discord first —
  https://github.com/Phineas/lanyard).
- `/blog` — markdown posts, sorted into folders, each with an upload date/time
  and a draft/published flag. Published posts are public; only I can write.
- `/photography` — a photo grid. Images get resized and re-encoded in the
  browser before upload, which also strips EXIF/GPS, so I'm not publishing the
  location my phone baked into every shot.
- `/friends` — a short, hand-picked list of Steam profiles with their online
  status.

Everything except the home card is backed by Supabase. There's no server of my
own for the data — the browser talks to Supabase directly and Row Level Security
makes sure only the logged-in owner can write anything. The Steam page is the
one exception; it needs a small serverless function so the API key stays off the
client (see below).

## Setup

You'll need a free Supabase project.

1. Make a project at supabase.com.
2. In the SQL editor, run these in order: db/schema.sql,
   db/schema-photography.sql, db/schema-friends.sql. They create the tables, the
   photo storage bucket, and the RLS policies.
3. Authentication → Users → Add user. That email and password is the owner
   login — there's deliberately no sign-up form on the site. Make exactly one
   user; anyone with an account is treated as the owner.
4. Settings → API: grab the project URL and the anon key.
5. Copy .env.example to .env and fill it in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
STEAM_API_KEY=...        # only for /friends
```

The anon key is supposed to be public — it can only do what RLS lets it. Don't
put the service_role key anywhere near the client.

### Steam (skip if you don't want /friends)

Grab a key from https://steamcommunity.com/dev/apikey. It's a secret, so it goes
in STEAM_API_KEY (note: no VITE_ prefix) and is only ever read by api/steam.js,
which runs as a Vercel function. The page calls /api/steam, never Steam
directly — which also sidesteps the fact that Steam sends no CORS headers.
Responses are cached at the CDN for about ten minutes so the API isn't hit on
every visit. Online status only shows for friends whose Steam profile is public;
private ones read as offline.

## Develop

```
npm install
npm run dev      # localhost:5173
npm run build    # tsc + vite build -> dist/
npm run test     # vitest
```

One gotcha: `npm run dev` is plain Vite, so it doesn't run api/steam.js and the
friends page will error locally. If you actually need to test Steam on your
machine, run `vercel dev` instead. Blog and photography work fine under normal
dev.

## Deploy

Works on either Vercel or Cloudflare Pages. The Steam proxy ships in both
formats — api/steam.js for Vercel, functions/api/steam.js for Cloudflare — and
only the host's own one runs, so they don't clash.

### Vercel

Import the repo on vercel.com — it picks up Vite by itself. Add the env vars
from .env under Project → Settings → Environment Variables (include
STEAM_API_KEY if you use friends), then deploy. vercel.json rewrites every path
to index.html so a deep link like /blog/some-post survives a hard refresh.

### Cloudflare Pages

Create a Pages project from the repo. Build command `npm run build`, output
directory `dist`. Add the env vars under Settings → Environment variables — the
VITE_ ones are needed at build time, STEAM_API_KEY at runtime for the function.
SPA routing comes from public/_redirects, and functions/api/steam.js is detected
as a Pages Function automatically. To test the function locally:
`npx wrangler pages dev dist` (after a build) — plain `npm run dev` doesn't run
it.

## License

The code is MIT — see LICENSE. Take it, learn from it, build your own. That
covers the code only. The content (blog posts, photos, and my name / branding)
is © kiy0w0, all rights reserved, and is not part of the MIT grant. Reuse the
implementation, not my identity.
