# Made in Honduras

A static Next.js photography archive for [madeinhonduras.net](http://madeinhonduras.net/), replacing Koken/PHP with Markdown and local images. No CMS, database, login, API, subscription, runtime image optimizer or dependency on the old host is required to build or serve it.

**Imported:** nine galleries containing 182 available photographs, both Why/Who pages and the author portrait. Two already-broken public-index records were removed at the owner’s request. The originals and database still need a separate backup before DigitalOcean is retired. See [migration details](docs/MIGRATION.md).

## Run locally

Use Node.js 22.x (22.13 or later within that major) and npm. Dependencies are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
```

Production verification and static preview:

```sh
npm run check
npm run build
npm run preview
```

Preview is at `http://127.0.0.1:4173`. The deployable directory is `out/`. To run desktop Chromium and mobile Chromium/WebKit browser tests:

```sh
npx playwright install chromium webkit
npm run test:e2e
```

GitHub Actions performs the checks, build and browser tests on pushes and pull requests. Normal builds use committed files and never contact Koken.

## Edit a page or gallery

- `content/pages/why.md`, `who.md`: the two text pages.
- `content/albums/*.md`: title, short `summary`, `cover` photo slug, numeric `order`, ordered list of photo slugs, and longer Markdown description. The latter appears under “About this place”.
- `content/photos/*.md`: photo title and provenance in frontmatter; the Markdown body is its caption. Do not change existing `slug` values unless you also create a redirect.
- `content/archive.json`: all published photo slugs in the original public-index order. It powers the legacy `/content/` index.
- `content/images.json`: generated image metadata; do not edit by hand.

Change the list under an album's `photos` to reorder it. A photograph may belong to more than one album; all memberships share one image asset. Covers must refer to a photo in the same album. The source snapshot in `migration/inventory.json` records the initial migration; keep it intact for comparison.

## Add a photograph

Keep its full-resolution original outside Git and the public directory. For example, put a local working copy in the ignored `.migration-cache/masters/` folder. Create `content/photos/my-new-photo.md`:

```yaml
---
slug: my-new-photo
id: my-new-photo
title: A morning in Roatán
original: .migration-cache/masters/my-new-photo.jpg
exif: []
---
Your caption in Markdown.
```

Add `my-new-photo` to the chosen album's `photos` list and to `content/archive.json`, then run:

```sh
npm run images
npm run check
npm run build
npm run test:e2e
```

Commit the Markdown, archive list, generated `content/images.json` and new files in `public/images`. Don't commit the master. The image command reuses committed variants for imported photographs, so adding a new local photo does not need the old host. Changed local masters get new content hashes automatically. `npm run images -- --refresh` rebuilds imported images from the ignored source cache or, if unavailable, their public source URLs. The command generates WebP at 480, 960, 1600 and up to 2048 pixels wide without upscaling, strips EXIF/GPS/XMP, and uses content-hashed filenames. Keep an independent backup of originals and prior source masters: generated variants aren't archival backups.

To add a place, copy an album file, choose a unique slug and order, add at least one photo and a valid cover, and fill its short description. No code changes are needed. Run the checks and build.

## Connect Vercel

1. Import the private **personal** GitHub repository into Vercel.
2. Use the Next.js preset, Node.js 22.x, `npm ci`, and build command `npm run build`. Leave the Output Directory override disabled. Vercel’s Next.js builder reads its manifests from `.next` and detects `output: "export"` automatically; setting the override to `out` makes it look for manifests in the wrong directory. Local static hosting still serves `out/`. No environment variables are needed.
3. Review the preview deployment at desktop/mobile sizes; check every album, captions, Why/Who and legacy photo links. Confirm the Network panel only loads local images/fonts/scripts.
4. Add the apex and `www` domains only when ready. Use Vercel's current DNS instructions, select the apex as primary, and preserve unrelated DNS records.
5. Follow the backup, cutover and retirement checklist in [MIGRATION.md](docs/MIGRATION.md) before removing anything from DigitalOcean.

The owner confirmed this is a personal photography archive, which fits Hobby's personal/non-commercial use restriction. As checked on 2026-10-04, Hobby includes 100 GB/month Fast Data Transfer and one million edge requests. Usage limits still apply; this is not an unlimited or guaranteed-free hosting promise. This site uses pre-generated local images, so it makes no Vercel image-optimization requests. [Hobby plan](https://vercel.com/docs/plans/hobby), [fair-use rules](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage).

## Implementation

Next.js App Router with `output: 'export'`, TypeScript, Tailwind CSS, React Photo Album's server-rendered justified rows, PhotoSwipe loaded on demand, sanitized Markdown and Sharp for offline images. Locally hosted Bricolage Grotesque headings pair with the original PT Sans for reading. The pocket-album design has mobile bottom navigation, compact photo rows, and a full-screen viewer with a thumbnail strip, swipe navigation, pinch zoom and vertical dismissal. Browser history and direct legacy photo routes are supported; JavaScript only enhances browsing. Custom CSS is limited to base styles and generated PhotoSwipe controls.

See [design notes](docs/DESIGN.md), [migration inventory and route map](docs/MIGRATION.md), and [verification evidence](docs/VERIFICATION.md). All photos remain copyright Marcio Barrios. This repository grants no license to reuse them.
