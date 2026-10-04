import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import sharp from "sharp";
import { loadContent, routeEntries, markdown } from "../src/lib/content.mjs";
const content = loadContent();
const inventory = JSON.parse(readFileSync("migration/inventory.json", "utf8"));
const images = JSON.parse(readFileSync("content/images.json", "utf8"));
test("Content references, covers, slugs and ordering are valid", () => {
  assert.equal(
    new Set(content.photos.map((p) => p.slug)).size,
    content.photos.length,
  );
  assert.equal(
    new Set(content.photos.map((p) => p.id)).size,
    content.photos.length,
  );
  assert.equal(
    new Set(content.albums.map((a) => a.slug)).size,
    content.albums.length,
  );
  assert.equal(
    new Set(content.albums.map((a) => a.order)).size,
    content.albums.length,
  );
  for (const album of content.albums) {
    assert.ok(album.title && album.summary);
    assert.match(album.slug, /^[a-z0-9-]+$/);
    assert.ok(album.photos.includes(album.cover));
    assert.equal(new Set(album.photos).size, album.photos.length);
    for (const slug of album.photos)
      assert.ok(content.photos.some((p) => p.slug === slug));
  }
  for (const photo of content.photos) {
    assert.match(photo.id, /^[a-z0-9-]+$/);
    assert.match(photo.slug, /^[a-z0-9-]+$/);
  }
  assert.equal(new Set(content.archive).size, content.archive.length);
  assert.deepEqual(
    [...content.archive].sort(),
    content.photos.map((p) => p.slug).sort(),
  );
  for (const original of inventory.photos)
    assert.ok(
      content.photos.some((p) => p.slug === original.slug),
      "Preserve imported slug " + original.slug,
    );
  assert.equal(content.pages.length, 2);
});
test("Public metadata and local image variants are complete; no originals/GPS are shipped", async () => {
  for (const photo of [...content.photos, inventory.portrait]) {
    if (photo.status === "missing-source") {
      assert.equal(photo.width, 0);
      continue;
    }
    const image = images[photo.id];
    assert.ok(image, photo.slug);
    assert.ok(photo.title);
    assert.ok(image.width > 0 && image.height > 0);
    assert.ok(image.srcSet.length >= 1);
    let last = 0;
    for (const variant of image.srcSet) {
      assert.ok(variant.src.startsWith("/images/"));
      assert.ok(existsSync("public" + variant.src));
      assert.ok(variant.width > last);
      last = variant.width;
      const meta = await sharp("public" + variant.src).metadata();
      assert.equal(meta.width, variant.width);
      assert.equal(meta.height, variant.height);
      assert.equal(meta.exif, undefined);
      assert.equal(meta.xmp, undefined);
    }
  }
});
test("Legacy photo URLs resolve uniquely and point to the correct album/photo", () => {
  const entries = routeEntries(content);
  const paths = entries.map((e) => "/" + e.path.join("/") + "/");
  assert.equal(new Set(paths).size, paths.length);
  for (const photo of inventory.photos) {
    const original = new URL(photo.sourcePage).pathname;
    assert.ok(paths.includes(original));
    assert.ok(paths.includes(original + "lightbox/"));
    assert.ok(paths.includes(`/content/${photo.slug}/`));
    assert.ok(paths.includes(`/content/${photo.slug}/lightbox/`));
  }
});
test("Markdown keeps links and structure but drops executable content", () => {
  const result = markdown(
    "## Hello\n\n[Safe](https://example.com) <script>alert(1)</script>\n\n[x](javascript:alert(1))",
  );
  assert.match(result, /<h2>Hello<\/h2>/);
  assert.match(result, /href="https:\/\/example.com"/);
  assert.doesNotMatch(result, /<script|javascript:/);
});
