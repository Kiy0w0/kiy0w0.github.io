import { expect, test } from "vitest";
import { slugify, formatDateTime } from "./blog";

test("slugify lowercases and hyphenates", () => {
  expect(slugify("Hello World")).toBe("hello-world");
});

test("slugify strips punctuation and collapses spaces", () => {
  expect(slugify("  Foo!!   Bar  ")).toBe("foo-bar");
});

test("slugify collapses repeated hyphens and trims them", () => {
  expect(slugify("a---b-")).toBe("a-b");
});

test("formatDateTime renders date and time with a middot", () => {
  // Fixed UTC instant; assert the shape, not the exact tz-shifted value.
  const out = formatDateTime("2026-06-25T14:30:00Z");
  expect(out).toMatch(/\d{2} \w{3} 2026 · \d{2}:\d{2}/);
});
