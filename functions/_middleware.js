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

  const upstream = await fetch(row.ik_url, {
    headers: request.headers.get("range") ? { range: request.headers.get("range") } : {},
  });
  if (!upstream.ok && upstream.status !== 206) return next();

  const ct = row.content_type || TYPES[ext] || upstream.headers.get("content-type") || "application/octet-stream";
  const headers = new Headers();
  headers.set("content-type", ct);
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
