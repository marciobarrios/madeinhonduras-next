# Verification

Checked locally on 2026-10-04 against the production static export. The browser suite runs again on GitHub Actions after every push; see [workflow runs](https://github.com/marciobarrios/madeinhonduras-next/actions).

- ESLint and TypeScript: pass.
- Five content/image tests: valid references/slugs/covers; local image dimensions and absent EXIF/XMP; unique legacy routes; Markdown sanitization; correctly oriented, metadata-free variants from an EXIF-rotated local master.
- Production build: 751 generated entries, including 746 content URLs plus framework/metadata outputs. Every content route exists on disk and all rendered image/srcset references resolve to local files. The postbuild audit enforces this on CI.
- Twelve Playwright cases across desktop Chromium (1440 × 1000) and mobile Chromium (iPhone 13 emulation): all nine albums render; pages and portrait; no overflow; local-only resources in the primary journey; captions; arrows; Escape; Back/Forward; focus restoration; repeated opening; direct legacy and hash URLs; refresh; both missing-source records; public archive page 2; no-JavaScript navigation.
- Axe WCAG 2 A/AA and 2.1 AA automated scans: home, Roatán, Why, Who and the open viewer. No violations in the scanned states. This is automated coverage, not a full accessibility certification.
- Manual visual review: desktop/mobile home, album and full-screen viewer; no console errors during that review. Previews below come from the new local site, not private service screenshots.
- Original album order/cover comparison against the import snapshot: pass for all nine albums.
- `npm audit --omit=dev`: zero vulnerabilities at verification time. Full `npm audit` reports five high-severity entries in one development-only dependency chain (`eslint-config-next` → Next's ESLint plugin → fast-glob → micromatch → braces), for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The reported automatic remedy would downgrade Next's lint configuration across major versions, so it was not applied. No part of that lint chain is served by the static site; track a compatible upstream fix. CI patterns are repository-controlled.

## Preview images

[Desktop home](previews/home-desktop.png) · [Desktop album](previews/album-desktop.png) · [Desktop viewer](previews/viewer-desktop.png)

[Mobile home](previews/home-mobile.png) · [Mobile album](previews/album-mobile.png) · [Mobile viewer](previews/viewer-mobile.png)

## Limits

No Vercel build/deployment, live DNS cutover, production browser test, CMS/database export, originals backup, DigitalOcean cancellation or live-traffic budget estimate was performed. Those remain owner steps in [MIGRATION.md](MIGRATION.md). WebKit/Safari and Firefox were not tested in this initial handoff. The two missing public source images could not be recovered from their advertised display URLs.
