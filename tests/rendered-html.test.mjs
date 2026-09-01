import assert from "node:assert/strict";
import test from "node:test";

test("renders the Horizon 45 landing page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();

  assert.match(html, /<title>Горизонт 45 — Бухта Космонавтов<\/title>/);
  assert.match(html, /45\.394202° N · 36\.627198° E/);
  assert.match(html, /src="https:\/\/azgard-crimea\.ru\/"/);
  assert.match(html, /title="Панорамный 3D-тур по проекту Азгард"/);
  assert.match(html, /aria-label="Мобильная навигация"/);
});
