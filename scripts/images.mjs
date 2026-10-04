/** Generate local, EXIF-free display variants from public Koken derivatives or local masters. */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { loadContent } from "../src/lib/content.mjs";
const { photos } = loadContent();
const inventory = JSON.parse(
  await readFile("migration/inventory.json", "utf8"),
);
const assets = [
  ...photos.filter((p) => p.status !== "missing-source"),
  inventory.portrait,
];
const sizes = [480, 960, 1600, 2048];
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
  const meta = await sharp(source).metadata();
  const hash = createHash("sha256")
    .update(source)
    .update("webp-q82-v1")
    .digest("hex")
    .slice(0, 12);
  const widths = [...new Set(sizes.map((w) => Math.min(w, meta.width)))];
  const variants = [];
  for (const width of widths) {
    const dest = `/images/${photo.id}-${hash}-${width}.webp`;
    let info;
    try {
      const existing = await sharp("public" + dest).metadata();
      const bytes = (await readFile("public" + dest)).length;
      info = { width: existing.width, height: existing.height, size: bytes };
    } catch {
      info = await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile("public" + dest);
    }
    variants.push({
      src: dest,
      width: info.width,
      height: info.height,
      bytes: info.size,
    });
  }
  const largest = variants.at(-1);
  manifest[photo.id] = {
    width: largest.width,
    height: largest.height,
    src: largest.src,
    srcSet: variants,
  };
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
