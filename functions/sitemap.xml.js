const STATIC = ["/", "/blog", "/photography", "/friends"];

export async function onRequest(context) {
  const { env, request } = context;
  const origin = new URL(request.url).origin;

  let posts = [];
  try {
    const url =
      `${env.VITE_SUPABASE_URL}/rest/v1/posts` +
      `?published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500`;
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

  const urls = [
    ...STATIC.map((path) => ({ loc: `${origin}${path}`, lastmod: null })),
    ...posts.map((p) => ({
      loc: `${origin}/blog/${encodeURIComponent(p.slug)}`,
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : null,
    })),
  ];

  const body = urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
