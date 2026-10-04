import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
const root = path.join(process.cwd(), "content");
export function markdown(text) {
  return sanitizeHtml(marked.parse(text, { async: false }), {
    allowedTags: [
      "p",
      "br",
      "em",
      "strong",
      "a",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "blockquote",
    ],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
function readFolder(folder) {
  return readdirSync(path.join(root, folder))
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(
        readFileSync(path.join(root, folder, file), "utf8"),
      );
      return { ...data, body: content.trim(), html: markdown(content) };
    });
}
export function loadContent() {
  return {
    albums: readFolder("albums").sort((a, b) => a.order - b.order),
    photos: readFolder("photos"),
    pages: readFolder("pages"),
    archive: JSON.parse(readFileSync(path.join(root, "archive.json"), "utf8")),
  };
}
export function routeEntries(content) {
  const entries = content.pages.map((page) => ({
    path: ["pages", page.slug],
    kind: "page",
    page,
  }));
  for (let page = 1; page <= Math.ceil(content.archive.length / 100); page++)
    entries.push({
      path: page === 1 ? ["content"] : ["content", "page", String(page)],
      kind: "archive",
      archivePage: page,
    });
  for (const album of content.albums) {
    entries.push({ path: ["places", album.slug], kind: "album", album });
    for (const slug of album.photos) {
      const photo = content.photos.find((p) => p.slug === slug);
      for (const suffix of [[], ["lightbox"]])
        entries.push({
          path: ["places", album.slug, "content", slug, ...suffix],
          kind: "photo",
          album,
          photo,
          lightbox: !!suffix.length,
        });
    }
  }
  for (const photo of content.photos) {
    const album = content.albums.find((a) => a.photos.includes(photo.slug));
    for (const suffix of [[], ["lightbox"]])
      entries.push({
        path: ["content", photo.slug, ...suffix],
        kind: "photo",
        album,
        photo,
        lightbox: !!suffix.length,
      });
  }
  return entries;
}
