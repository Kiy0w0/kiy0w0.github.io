// @vitest-environment jsdom
import { expect, test } from "vitest";
import { processImage } from "./image";

test("non-image files pass through unchanged", async () => {
  const f = new File(["hi"], "a.txt", { type: "text/plain" });
  expect(await processImage(f)).toBe(f);
});

test("gif passes through unchanged (animation preserved)", async () => {
  const f = new File(["x"], "a.gif", { type: "image/gif" });
  expect(await processImage(f)).toBe(f);
});
