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
