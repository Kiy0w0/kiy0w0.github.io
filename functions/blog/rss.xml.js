const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function onRequest(context) {
  const { env, request } = context;
  const origin = new URL(request.url).origin;

  let posts = [];
  try {
    const url =
      `${env.VITE_SUPABASE_URL}/rest/v1/posts` +
      `?published=eq.true&select=title,slug,excerpt,created_at` +
      `&order=created_at.desc&limit=50`;
    const r = await fetch(url, {
      headers: {
        apikey: env.VITE_SUPABASE_ANON_KEY,
        authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    const arr = await r.json();
    posts = Array.isArray(arr) ? arr : [];
  } catch {
    posts = [];
  }

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${origin}/blog/${esc(p.slug)}</link>
      <guid>${origin}/blog/${esc(p.slug)}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || "")}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>kiy0w0 · blog</title>
    <link>${origin}/blog</link>
    <description>self taught developer · open source</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
