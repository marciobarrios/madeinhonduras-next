/** Read-only importer of publicly linked Koken pages. Never calls the admin/API. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { load } from "cheerio";
import TurndownService from "turndown";
import matter from "gray-matter";

const root = process.cwd();
const cache = path.join(root, ".migration-cache/html");
const output = path.resolve(process.argv[2] || "migration/imported-content");
await mkdir(cache, { recursive: true });
for (const folder of ["albums", "photos", "pages"])
  await mkdir(path.join(output, folder), { recursive: true });
const md = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
const origin = "http://madeinhonduras.net";
const sources = new Set();
async function page(url) {
  const u = new URL(url, origin);
  if (
    !["madeinhonduras.net", "www.madeinhonduras.net"].includes(u.hostname) ||
    u.search ||
    u.pathname.includes("/admin")
  )
    throw Error("Not an allowed public URL");
  u.hostname = "madeinhonduras.net";
  sources.add(u.href);
  const file = path.join(
    cache,
    createHash("sha256").update(u.href).digest("hex") + ".html",
  );
  let html;
  try {
    html = await readFile(file, "utf8");
  } catch {
    const res = await fetch(u, {
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    if (!res.ok) throw Error(`${u.pathname}: HTTP ${res.status}`);
    html = await res.text();
    await writeFile(file, html);
  }
  return load(html);
}
function imageData(img) {
  const base = img.attr("data-base");
  const ext = img.attr("data-extension");
  const presets = img
    .attr("data-presets")
    ?.split(" ")
    .map((p) => p.split(","));
  if (!base || !ext || !presets?.length) throw Error("Image metadata missing");
  const [preset, width, height] = presets.at(-1);
  return {
    sourceUrl: base + preset + "." + ext,
    width: +width,
    height: +height,
  };
}
async function writeMarkdown(folder, slug, data, body) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw Error("Unsafe content slug");
  await writeFile(
    path.join(output, folder, slug + ".md"),
    matter.stringify(body || "", data),
  );
}
const home = await page("/");
const albums = [];
const photos = new Map();
for (const el of home("#sets-layout > .item").toArray()) {
  const item = home(el);
  const href = item.find("h2 a").attr("href");
  const slug = href.split("/").filter(Boolean).at(-1);
  const album = {
    slug,
    title: item.find("h2").text().trim(),
    summary: item.find("p").text().trim(),
    order: albums.length,
    sourceUrl: origin + href,
    photos: [],
  };
  const cover = imageData(item.find("img[data-base]").first()).sourceUrl;
  let current = href;
  const seenPages = new Set();
  let description;
  while (current && !seenPages.has(current)) {
    seenPages.add(current);
    const $ = await page(current);
    description ??= md.turndown($("#album-desc").html() || "");
    for (const li of $("#img-grid > li").toArray()) {
      const img = $(li).find("img[data-base]").first();
      if (img.attr("data-visibility") !== "public")
        throw Error("Non-public image in public album");
      const image = imageData(img);
      const photoHref = $(li)
        .find("a")
        .attr("href")
        .replace(/lightbox\/$/, "");
      const photoSlug = photoHref.split("/").filter(Boolean).at(-1);
      if (!photos.has(photoSlug)) {
        const photoPage = await page(photoHref);
        const id = new URL(image.sourceUrl).pathname
          .match(/images\/(\d+)\/(\d+)\//)
          ?.slice(1)
          .join("");
        if (!id) throw Error("Missing source content ID");
        const photo = {
          slug: photoSlug,
          id,
          title:
            photoPage(".text-content h2").text().trim() || img.attr("data-alt"),
          ...image,
          sourcePage: origin + photoHref,
          exif: photoPage("#exif_meta li")
            .toArray()
            .map((e) => photoPage(e).text().trim()),
          caption: md.turndown(photoPage("#caption-content").html() || ""),
        };
        photos.set(photoSlug, photo);
        const { caption, ...meta } = photo;
        await writeMarkdown("photos", photoSlug, meta, caption);
      }
      if (!album.photos.includes(photoSlug)) album.photos.push(photoSlug);
      if (new URL(image.sourceUrl).pathname === new URL(cover).pathname)
        album.cover = photoSlug;
    }
    const next = $('a[rel="next"], .pag a.next').first().attr("href");
    current = next || null;
  }
  if (!album.photos.length || !album.cover)
    throw Error(`Album incomplete: ${slug}`);
  await writeMarkdown("albums", slug, album, description);
  albums.push(album);
  console.log(`${album.title}: ${album.photos.length} photos`);
}
// Audit the public photo index as well: photographs can exist outside albums.
const archive = [];
let indexUrl = "/content/";
const indexPages = new Set();
while (indexUrl && !indexPages.has(indexUrl)) {
  indexPages.add(indexUrl);
  const $ = await page(indexUrl);
  for (const element of $(
    'img[data-base][data-visibility="public"]',
  ).toArray()) {
    const img = $(element);
    const href = img.closest("a").attr("href");
    if (!href?.startsWith("/content/")) continue;
    const slug = href.split("/").filter(Boolean).at(-1);
    if (!archive.includes(slug)) archive.push(slug);
    if (!photos.has(slug)) {
      const detail = await page(href);
      const image = imageData(img);
      const id = new URL(image.sourceUrl).pathname
        .match(/images\/(\d+)\/(\d+)\//)
        ?.slice(1)
        .join("");
      if (!id) throw Error("Missing source content ID");
      const caption = md.turndown(detail("#caption-content").html() || "");
      const photo = {
        slug,
        id,
        ...(image.width === 0 ? { status: "missing-source" } : {}),
        title: detail(".text-content h2").text().trim() || img.attr("data-alt"),
        ...image,
        sourcePage: origin + href,
        exif: detail("#exif_meta li")
          .toArray()
          .map((e) => detail(e).text().trim()),
      };
      photos.set(slug, { ...photo, caption });
      await writeMarkdown("photos", slug, photo, caption);
      console.log(`Public photograph outside albums: ${slug}`);
    }
  }
  indexUrl = $('a[data-bind-to-key="right"]').attr("href") || null;
}
await writeFile(
  path.join(output, "archive.json"),
  JSON.stringify(archive, null, 2) + "\n",
);
let portrait;
for (const slug of ["why", "who"]) {
  const $ = await page(`/pages/${slug}/`);
  const article = $("article").clone();
  const title = article.find("h2").first().text();
  article.find("h2").first().remove();
  const img = article.find("img[data-base]").first();
  if (img.length)
    portrait = { id: "portrait", title: "Marcio Barrios", ...imageData(img) };
  article.find("figure").remove();
  await writeMarkdown(
    "pages",
    slug,
    { slug, title, ...(slug === "who" ? { image: "portrait" } : {}) },
    md.turndown(article.html() || ""),
  );
}
const manifest = {
  importedAt: new Date().toISOString(),
  source: origin,
  scope:
    "All nine homepage albums, all pages of the public photo index, and Why/Who; not an authenticated CMS export.",
  albums: albums.map((a) => ({
    slug: a.slug,
    title: a.title,
    count: a.photos.length,
    photos: a.photos,
    cover: a.cover,
  })),
  photos: [...photos.values()].map((p) => {
    const result = { ...p };
    delete result.caption;
    return result;
  }),
  archive,
  portrait,
  sources: [...sources],
};
await writeFile(
  path.join(output, "inventory.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  `Imported ${albums.length} albums, ${photos.size} distinct photos and 2 pages into ${output}`,
);
