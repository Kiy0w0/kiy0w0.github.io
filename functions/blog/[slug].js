// Cloudflare Pages Function for /blog/:slug — injects real OG/title tags so link
// previews (Discord, WhatsApp, Twitter) show the post, not the static default.
// Social crawlers don't run JS, so the JS useMeta hook can't help them; this
// rewrites the HTML <head> server-side before the page is sent.
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
    return res; // on any failure, serve the default shell unchanged
  }
  if (!post) return res;

  const title = `${post.title} · kiy0w0`;
  const desc = post.excerpt || "";
  const image = post.cover_url || "";

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
