const TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  ico: "image/x-icon",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  wav: "audio/wav",
  pdf: "application/pdf",
  txt: "text/plain",
};

const BOT = /discordbot|twitterbot|slackbot|telegrambot|facebookexternalhit|whatsapp|linkedinbot|embedly|pinterest|redditbot|skypeuripreview|vkshare|googlebot|bingbot/i;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function kindOf(ct, ext) {
  if ((ct || "").startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "ico", "bmp", "svg", "avif"].includes(ext)) return "image";
  if ((ct || "").startsWith("video/") || ["mp4", "webm", "mov"].includes(ext)) return "video";
  if ((ct || "").startsWith("audio/") || ["mp3", "ogg", "wav"].includes(ext)) return "audio";
  return "other";
}

function embedHtml(url, kind, ct) {
  const raw = `${url.origin}${url.pathname}?raw=1`;
  const title = url.pathname.replace(/^\//, "");
  const page = `${url.origin}${url.pathname}`;
  const tags = [
    `<meta property="og:site_name" content="chaewon.kuromi.foo">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:url" content="${esc(page)}">`,
    `<meta name="theme-color" content="#7a5cff">`,
  ];
  if (kind === "video") {
    tags.push(`<meta property="og:type" content="video.other">`);
    tags.push(`<meta property="og:video" content="${esc(raw)}">`);
    tags.push(`<meta property="og:video:secure_url" content="${esc(raw)}">`);
    tags.push(`<meta property="og:video:type" content="${esc(ct)}">`);
    tags.push(`<meta name="twitter:card" content="player">`);
  } else if (kind === "audio") {
    tags.push(`<meta property="og:type" content="music.song">`);
    tags.push(`<meta property="og:audio" content="${esc(raw)}">`);
  } else {
    tags.push(`<meta property="og:type" content="website">`);
    tags.push(`<meta property="og:image" content="${esc(raw)}">`);
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);
    tags.push(`<meta name="twitter:image" content="${esc(raw)}">`);
  }
  return `<!doctype html><html><head><meta charset="utf-8">${tags.join("")}</head><body></body></html>`;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (!url.hostname.startsWith("chaewon.")) return next();

  const m = url.pathname.match(/^\/([A-Za-z0-9_-]+)\.([A-Za-z0-9]+)$/);
  if (!m) return next();

  const slug = m[1];
  const ext = m[2].toLowerCase();

  let row = null;
  try {
    const q =
      `${env.VITE_SUPABASE_URL}/rest/v1/files` +
      `?slug=eq.${encodeURIComponent(slug)}&select=ik_url,content_type`;
    const r = await fetch(q, {
      headers: {
        apikey: env.VITE_SUPABASE_ANON_KEY,
        authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    const arr = await r.json();
    row = Array.isArray(arr) ? arr[0] : null;
  } catch {
    return next();
  }
  if (!row) return next();

  const ct = row.content_type || TYPES[ext] || "application/octet-stream";
  const kind = kindOf(ct, ext);
  const isRaw = url.searchParams.has("raw");
  const ua = request.headers.get("user-agent") || "";

  if (!isRaw && BOT.test(ua)) {
    return new Response(embedHtml(url, kind, ct), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" },
    });
  }

  const upstream = await fetch(row.ik_url, {
    headers: request.headers.get("range") ? { range: request.headers.get("range") } : {},
  });
  if (!upstream.ok && upstream.status !== 206) return next();

  const headers = new Headers();
  headers.set("content-type", ct || upstream.headers.get("content-type") || "application/octet-stream");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("access-control-allow-origin", "*");
  const len = upstream.headers.get("content-length");
  if (len) headers.set("content-length", len);
  const cr = upstream.headers.get("content-range");
  if (cr) headers.set("content-range", cr);
  const ar = upstream.headers.get("accept-ranges");
  if (ar) headers.set("accept-ranges", ar);

  return new Response(upstream.body, { status: upstream.status, headers });
}
