import { useEffect } from "react";

const SUFFIX = "Kuromi";

function upsert(key: "name" | "property", id: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${id}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(key, id);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Set the tab title + description/OG tags for the current page. This fixes the
// browser tab and Google (it renders JS); social-share crawlers don't run JS,
// so /blog/:slug previews are handled server-side in functions/blog/[slug].js.
export function useMeta(opts: { title: string; description?: string; image?: string }) {
  const { title, description, image } = opts;
  useEffect(() => {
    document.title = title;
    upsert("property", "og:title", title);
    if (description) {
      upsert("name", "description", description);
      upsert("property", "og:description", description);
    }
    if (image) {
      upsert("property", "og:image", image);
      upsert("name", "twitter:card", "summary_large_image");
    }
  }, [title, description, image]);
}

export const titled = (page: string) => `${page} · ${SUFFIX}`;
