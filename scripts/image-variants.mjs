import { mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

/** Generate display files from either an upright derivative or an EXIF-oriented master. */
export async function generateVariants(
  source,
  id,
  directory = "public/images",
) {
  if (!/^[a-z0-9-]+$/.test(id)) throw Error("Invalid image ID");
  await mkdir(directory, { recursive: true });
  const meta = await sharp(source).metadata();
  const rotated = (meta.orientation ?? 1) >= 5 && (meta.orientation ?? 1) <= 8;
  const orientedWidth = rotated ? meta.height : meta.width;
  if (!orientedWidth) throw Error("Cannot read image dimensions");
  const hash = createHash("sha256")
    .update(source)
    .update("webp-q82-v1")
    .digest("hex")
    .slice(0, 12);
  const widths = [
    ...new Set([480, 960, 1600, 2048].map((w) => Math.min(w, orientedWidth))),
  ];
  const variants = [];
  for (const width of widths) {
    const name = `${id}-${hash}-${width}.webp`;
    const file = path.join(directory, name);
    let info;
    try {
      const existing = await sharp(file).metadata();
      const bytes = (await readFile(file)).length;
      info = { width: existing.width, height: existing.height, size: bytes };
    } catch {
      info = await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(file);
    }
    variants.push({
      src: "/images/" + name,
      width: info.width,
      height: info.height,
      bytes: info.size,
    });
  }
  const largest = variants.at(-1);
  return {
    width: largest.width,
    height: largest.height,
    src: largest.src,
    srcSet: variants,
  };
}
