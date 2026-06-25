import { marked } from "marked";
import DOMPurify from "dompurify";

// Only these hosts may appear in an <iframe src>. Anything else is dropped,
// even though only the owner writes posts — defense in depth.
const ALLOWED_IFRAME = /^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//;

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe") {
    const el = node as Element;
    if (!ALLOWED_IFRAME.test(el.getAttribute("src") || "")) el.remove();
  }
});

// Turn a YouTube/Vimeo link that sits alone on its own line into a responsive
// embed. Inline links inside a sentence are left as normal links.
function embed(md: string): string {
  return md.replace(/^[ \t]*(https?:\/\/\S+)[ \t]*$/gm, (line, url) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (yt) {
      return `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) {
      return `<div class="embed"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    }
    return line;
  });
}

export function renderMarkdown(md: string): string {
  const raw = marked.parse(embed(md), { async: false }) as string;
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "title"],
  });
}

export function MarkdownView({ source }: { source: string }) {
  return (
    <div className="prose-blog" dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />
  );
}
