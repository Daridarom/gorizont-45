import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const clientDirectory = path.join(projectRoot, "dist", "client");
const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const outputDirectory = path.join(projectRoot, "pages-dist");

const repository = process.env.GITHUB_REPOSITORY ?? "Daridarom/gorizont-45";
const repositoryName = repository.split("/").at(-1);
const basePath = process.env.GITHUB_PAGES_BASE_PATH ?? `/${repositoryName}`;

if (!repositoryName) {
  throw new Error("Не удалось определить имя репозитория GitHub.");
}

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("static-export", `${Date.now()}`);
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

if (!response.ok) {
  throw new Error(`Страница вернула статус ${response.status}.`);
}

let html = await response.text();

// Страница не требует клиентской логики: оставляем готовую разметку и стили,
// исключая серверные RSC-скрипты, которым на GitHub Pages некуда обращаться.
html = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, "")
  .replace(/((?:href|src)=["'])\/(?!\/)/gi, `$1${basePath}/`)
  .trim();

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(clientDirectory, outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "index.html"), `${html}\n`, "utf8");
await writeFile(path.join(outputDirectory, "404.html"), `${html}\n`, "utf8");
await writeFile(path.join(outputDirectory, ".nojekyll"), "", "utf8");

const referencedFiles = Array.from(
  html.matchAll(new RegExp(`(?:href|src)=["']${basePath}/([^"'#?]+)`, "g")),
  (match) => match[1],
);

for (const referencedFile of referencedFiles) {
  await access(path.join(outputDirectory, referencedFile));
}

if (!html.includes("https://azgard-crimea.ru/")) {
  throw new Error("В статической версии отсутствует панорамный 3D-тур.");
}

console.log(
  `GitHub Pages: подготовлено ${referencedFiles.length} локальных ресурсов.`,
);
