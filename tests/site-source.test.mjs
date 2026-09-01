import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("declares project metadata", () => {
  assert.match(layout, /title:\s*"Горизонт 45 — Бухта Космонавтов"/);
  assert.match(layout, /description:\s*"Ландшафтный комплекс/);
  assert.match(layout, /lang="ru"/);
});

test("keeps the panoramic tour available", () => {
  assert.match(page, /src="https:\/\/azgard-crimea\.ru\/"/);
  assert.match(page, /allowFullScreen/);
  assert.match(page, /Открыть на весь экран/);
});

test("includes every principal project view once", () => {
  const views = [
    "hero.webp",
    "houses.webp",
    "interior.webp",
    "cafe.webp",
    "spa.webp",
    "routes.webp",
    "events.webp",
    "sunset.webp",
  ];

  for (const view of views) {
    const occurrences = page.split(`/images/${view}`).length - 1;
    assert.equal(occurrences, 1, `${view} should be used exactly once`);
  }
});

test("preserves responsive navigation and tour layout", () => {
  assert.match(page, /className="mobile-dock"/);
  assert.match(css, /\.mobile-dock/);
  assert.match(css, /\.tour-frame iframe/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
});
