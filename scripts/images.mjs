/** Generate local, EXIF-free display variants from public Koken derivatives or local masters. */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { generateVariants } from "./image-variants.mjs";
import { loadContent } from "../src/lib/content.mjs";
const { photos } = loadContent();
const inventory = JSON.parse(
  await readFile("migration/inventory.json", "utf8"),
);
const assets = [
  ...photos.filter((p) => p.status !== "missing-source"),
  inventory.portrait,
];
await mkdir(".migration-cache/images", { recursive: true });
await mkdir("public/images", { recursive: true });
const manifest = {};
let previous = {};
try {
  previous = JSON.parse(await readFile("content/images.json", "utf8"));
} catch {
  /* first generation */
}
const refresh = process.argv.includes("--refresh");
for (const [index, photo] of assets.entries()) {
  if (!/^[a-z0-9-]+$/.test(photo.id)) throw Error("Invalid image ID");
  if (!photo.original && !refresh && previous[photo.id]) {
    try {
      await Promise.all(
        previous[photo.id].srcSet.map((v) => access("public" + v.src)),
      );
      manifest[photo.id] = previous[photo.id];
      continue;
    } catch {
      /* reconstruct missing derivatives from cache or public source */
    }
  }
  let source;
  const local = photo.original ? path.resolve(photo.original) : null;
  const cache = `.migration-cache/images/${photo.id}.jpg`;
  try {
    source = await readFile(local || cache);
  } catch {
    if (local) throw Error(`Missing local master: ${photo.original}`);
    const url = new URL(photo.sourceUrl);
    if (
      !["madeinhonduras.net", "www.madeinhonduras.net"].includes(
        url.hostname,
      ) ||
      !url.pathname.startsWith("/storage/cache/images/") ||
      url.search
    )
      throw Error("Unexpected source");
    url.hostname = "madeinhonduras.net";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    if (!res.ok) throw Error(`Image ${photo.id}: HTTP ${res.status}`);
    source = Buffer.from(await res.arrayBuffer());
    await writeFile(cache, source);
  }
  manifest[photo.id] = await generateVariants(source, photo.id);
  if ((index + 1) % 20 === 0)
    console.log(`Prepared ${index + 1}/${assets.length} photos`);
}
await writeFile(
  "content/images.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  `Prepared ${assets.length} images, ${Object.values(manifest).reduce((n, p) => n + p.srcSet.reduce((s, v) => s + v.bytes, 0), 0)} bytes`,
);
