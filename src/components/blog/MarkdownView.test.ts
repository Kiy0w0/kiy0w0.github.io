// @vitest-environment jsdom
import { expect, test } from "vitest";
import { renderMarkdown } from "./MarkdownView";

test("renders markdown headings to html", () => {
  expect(renderMarkdown("# Hi")).toContain("<h1");
});

test("strips script tags (sanitized)", () => {
  const html = renderMarkdown("# Hi\n\n<script>alert(1)</script>");
  expect(html).not.toContain("<script");
});

test("turns a lone youtube link into a youtube-nocookie embed", () => {
  const html = renderMarkdown("https://youtu.be/dQw4w9WgXcQ");
  expect(html).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
  expect(html).toContain("<iframe");
});

test("drops an iframe from a non-allowlisted host", () => {
  const html = renderMarkdown('<iframe src="https://evil.example.com/x"></iframe>');
  expect(html).not.toContain("evil.example.com");
});
