import { marked } from "marked";
import DOMPurify from "dompurify";

export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(raw);
}

export function MarkdownView({ source }: { source: string }) {
  return (
    <div className="prose-blog" dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />
  );
}
