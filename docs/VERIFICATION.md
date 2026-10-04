# Verification

Checked locally on 2026-10-04 against the production static export. The browser suite runs again on GitHub Actions after every push; see [workflow runs](https://github.com/marciobarrios/madeinhonduras-next/actions).

The first Vercel import completed the Next.js build but failed with `NEXT_NO_ROUTES_MANIFEST`: the `out` override made the Next.js builder look in the static export for its `.next/routes-manifest.json`. The override was removed from `vercel.json` and cleared in project settings; the Next.js preset and `output: "export"` remain. Node.js is pinned to 22.x in both the package and project settings. Deployment results are available in the [project dashboard](https://vercel.com/marcio-barrios-projects/madeinhonduras-next). See Vercel’s [framework build settings](https://vercel.com/docs/builds/configure-a-build#output-directory).

- ESLint and TypeScript: pass.
- Five content/image tests: valid references/slugs/covers; local image dimensions and absent EXIF/XMP; unique legacy routes; Markdown sanitization; correctly oriented, metadata-free variants from an EXIF-rotated local master.
- Production build: 747 generated entries, including 742 content URLs plus framework/metadata outputs. Every content route exists on disk and all rendered image/srcset references resolve to local files. The postbuild audit enforces this on CI.
- Twelve Playwright cases across desktop Chromium (1440 × 1000) and mobile Chromium (iPhone 13 emulation): all nine albums render; pages and portrait; no overflow; local-only resources in the primary journey; captions; arrows; Escape; Back/Forward; focus restoration; repeated opening; direct legacy and hash URLs; refresh; removed photo/lightbox URLs return 404; public archive page 2; no-JavaScript navigation.
- Axe WCAG 2 A/AA and 2.1 AA automated scans: home, Roatán, Why, Who and the open viewer. No violations in the scanned states. This is automated coverage, not a full accessibility certification.
- Manual visual review: desktop/mobile home, album and full-screen viewer; no console errors during that review. Previews below come from the new local site, not private service screenshots.
- Original album order/cover comparison against the import snapshot: pass for all nine albums.
- `npm audit --omit=dev`: zero vulnerabilities at verification time. Full `npm audit` reports five high-severity package entries for **one advisory**: [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), stack-exhaustion denial of service from deeply nested brace patterns. Installed development-only chain: `eslint-config-next@16.3.8` → `@next/eslint-plugin-next@16.3.8` → `fast-glob@3.3.1` → `micromatch@4.0.8` → `braces@3.0.3`. Affected versions are `braces <=3.0.3`; the advisory lists **no patched version**. GitHub lists CVSS v4 8.7, while npm's advisory payload reports CVSS v3.1 7.5; both classify it as High.
- Follow-up package checks on 2026-10-04: latest `braces` is 3.0.3; latest `micromatch` 4.0.8 still depends on it; latest `fast-glob` 3.3.3 still depends on that micromatch; latest `eslint-config-next` remains 16.3.8. No supported compatible update fixes the vulnerability. The suggested `npm audit fix --force` remedy downgrades `eslint-config-next` to 14.2.35, mismatching this Next.js 16 project, so it was not applied. No custom fork, audit suppression or unsupported override was introduced. This lint chain is not served by the static site, and lint patterns are repository-controlled; track an upstream patch.

## Preview images

[Desktop home](previews/home-desktop.png) · [Desktop album](previews/album-desktop.png) · [Desktop viewer](previews/viewer-desktop.png)

[Mobile home](previews/home-mobile.png) · [Mobile album](previews/album-mobile.png) · [Mobile viewer](previews/viewer-mobile.png)

## Limits

No live custom-domain DNS cutover, CMS/database export, originals backup, DigitalOcean cancellation or live-traffic budget estimate was performed. Those remain owner steps in [MIGRATION.md](MIGRATION.md). WebKit/Safari and Firefox were not tested in this initial handoff. The two already-broken public-source records were removed at the owner’s request.
