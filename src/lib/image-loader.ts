"use client";
import type { ImageLoaderProps } from "next/image";
/** Only maps to variants generated offline by `npm run images`. No image service. */
export default function imageLoader({ src, width }: ImageLoaderProps) {
  const match = src.match(/-(\d+)\.webp$/);
  if (!match) return src;
  const max = Number(match[1]);
  const size = Math.min(
    [480, 960, 1600, 2048].find((w) => w >= width) ?? 2048,
    max,
  );
  return src.replace(/-\d+\.webp$/, `-${size}.webp`);
}
