import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

let wasmReady = null;
let fontCache = null;

const TAGLINE = "self taught developer · open source";

async function getFont() {
  if (fontCache) return fontCache;
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Sora:wght@700",
    { headers: { "User-Agent": "Mozilla/5.0" } }
  ).then((r) => r.text());
  const url = css.match(/url\((https:\/\/[^)]+\.woff2?)\)/)?.[1];
  fontCache = await fetch(url).then((r) => r.arrayBuffer());
  return fontCache;
}

async function getPost(env, slug) {
  const url =
    `${env.VITE_SUPABASE_URL}/rest/v1/posts` +
    `?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=title,excerpt`;
  const r = await fetch(url, {
    headers: {
      apikey: env.VITE_SUPABASE_ANON_KEY,
      authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
    },
  });
  const arr = await r.json();
  return Array.isArray(arr) ? arr[0] : null;
}

function card({ label, title, subtitle }) {
  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: "#000",
        color: "#fff",
        fontFamily: "Sora",
      },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize: 28, color: "#a78bfa", letterSpacing: 2 },
            children: label,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: 24 },
            children: [
              {
                type: "div",
                props: {
                  style: { fontSize: 68, lineHeight: 1.1, fontWeight: 700 },
                  children: title,
                },
              },
              subtitle && {
                type: "div",
                props: {
                  style: { fontSize: 30, color: "#9ca3af", lineHeight: 1.4 },
                  children: subtitle,
                },
              },
            ].filter(Boolean),
          },
        },
        {
          type: "div",
          props: {
            style: { height: 8, width: 160, borderRadius: 4, background: "#a78bfa" },
          },
        },
      ],
    },
  };
}

export async function onRequest(context) {
  const { params, env } = context;
  const slug = String(params.slug).replace(/\.png$/, "");

  let tree;
  if (slug === "default") {
    tree = card({ label: "kiy0w0", title: "kiy0w0", subtitle: TAGLINE });
  } else {
    const post = await getPost(env, slug);
    if (!post) return new Response("Not found", { status: 404 });
    tree = card({
      label: "kiy0w0 · blog",
      title: post.title,
      subtitle: post.excerpt ? post.excerpt.slice(0, 140) : null,
    });
  }

  const font = await getFont();
  const svg = await satori(tree, {
    width: 1200,
    height: 630,
    fonts: [{ name: "Sora", data: font, weight: 700, style: "normal" }],
  });

  if (!wasmReady) {
    wasmReady = initWasm(
      fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm")
    );
  }
  await wasmReady;

  const png = new Resvg(svg).render().asPng();

  return new Response(png, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=86400",
    },
  });
}
