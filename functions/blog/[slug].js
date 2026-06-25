const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export async function onRequest(context) {
  const { params, env, next } = context;
  const res = await next();
  if (!(res.headers.get("content-type") || "").includes("text/html")) return res;

  let post = null;
  try {
    const url =
      `${env.VITE_SUPABASE_URL}/rest/v1/posts` +
      `?slug=eq.${encodeURIComponent(params.slug)}&published=eq.true` +
      `&select=title,excerpt,cover_url`;
    const r = await fetch(url, {
      headers: {
        apikey: env.VITE_SUPABASE_ANON_KEY,
        authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    const arr = await r.json();
    post = Array.isArray(arr) ? arr[0] : null;
  } catch {
    return res;
  }
  if (!post) return res;

  const title = `${post.title} · kiy0w0`;
  const desc = post.excerpt || "";
  const origin = new URL(context.request.url).origin;
  const image = post.cover_url || `${origin}/og/${encodeURIComponent(params.slug)}.png`;

  return new HTMLRewriter()
    .on("title", { element: (e) => e.setInnerContent(title) })
    .on('meta[name="description"]', { element: (e) => e.setAttribute("content", desc) })
    .on("head", {
      element(e) {
        e.append(`<meta property="og:title" content="${esc(title)}">`, { html: true });
        e.append(`<meta property="og:description" content="${esc(desc)}">`, { html: true });
        e.append(`<meta property="og:type" content="article">`, { html: true });
        if (image) {
          e.append(`<meta property="og:image" content="${esc(image)}">`, { html: true });
          e.append(`<meta name="twitter:card" content="summary_large_image">`, { html: true });
        }
      },
    })
    .transform(res);
}
