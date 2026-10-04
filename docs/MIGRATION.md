# Migration record and cutover checklist

## Scope and inventory (2026-10-04)

This is a read-only public migration of Koken 0.19.0 / Axis 1.5.2. No CMS login, admin API, credentials, DNS change, deployment or DigitalOcean modification was used. Public HTTP worked; the site's HTTPS port refused connections. Do not enter CMS credentials over HTTP. The available tool set did not expose a usable 1Password login-item retrieval action; none was needed for the public import.

| Original place | Preserved path | Photographs |
| --- | --- | ---: |
| Roatán | `/places/roatan/` | 12 |
| Cayos Cochinos | `/places/cayos-cochinos/` | 34 |
| Pico Bonito | `/places/pico-bonito/` | 23 |
| Utila | `/places/utila/` | 36 |
| Yojoa Lake and Pulhapanzak | `/places/yojoa-lake-and-pulhapanzak/` | 7 |
| La Ceiba and surroundings | `/places/la-ceiba/` | 28 |
| Copán | `/places/copan/` | 18 |
| Cuero y Salado | `/places/cuero-y-salado/` | 10 |
| Jeanette Kawas National Park | `/places/punta-sal/` | 14 |
| **All galleries** | | **182** |

The public `/content/` index has 184 records. Two aren't members of a gallery and already have missing source files:

- `/content/mg-2702/`, original title `MG-2702.jpg`, Koken ID `000076`.
- `/content/mg-1286/`, original title `MG-1286.JPG`, Koken ID `000064`.

Both report `0 × 0` dimensions in Koken; the advertised medium, large and huge image URLs returned HTTP 404 on 2026-10-04. Their Markdown records and page/lightbox URLs remain, with a clear unavailable message. No substitute photographs were invented. Recover them from an original backup if possible. They aren't included as broken thumbnails in the photo index.

The Why/Who text is preserved in Markdown; the Who portrait is a separate available asset. All public album covers, membership and order match the source snapshot. Photo captions and publicly rendered exposure settings are retained. Public pages don't expose reliable dates for all images; timestamps encoded in Koken cache filenames are **not** treated as capture dates. Private/unlisted content, original EXIF and filesystem originals were not accessed or claimed to be migrated.

Authoritative provenance is in [`migration/inventory.json`](../migration/inventory.json): public page/source image URLs, imported records, album ordering and covers, public-index order, date and missing items. Source screenshot attachments and raw page caches are excluded from Git.

## Files and size

183 available images (182 photographs + portrait), **722** pre-generated WebP files, **128,748,706 bytes** (128.7 MB / 122.8 MiB). Portrait-oriented sources can be narrower than 1600/2048 pixels, so no upscaling or redundant variants are generated. Images are at quality 82, width 480/960/1600/up to 2048, with original aspect ratio and no embedded EXIF/GPS/XMP. Full-screen viewing uses the largest available derivative, not camera originals.

The initial full export is approximately 227 MiB on disk, including all compatibility pages, HTML/RSC payloads, fonts and scripts. Ordinary visits download only responsive images they view, not the whole archive. Pre-generated files avoid image compute, but image requests still consume hosting bandwidth. Measure real Vercel transfer/request usage after launch. Vercel's 100 MB CLI source-upload limit is not a blanket generated-site size limit; this handoff uses Git import. No Vercel deployment or build has been executed here.

Normal builds and hosting require only committed assets. The ignored `.migration-cache/images` contains about 106 MiB of downloaded **Koken display derivatives**, not a backup of full-resolution originals.

## Reproduce/import safely

```sh
npm ci
npm run import:koken -- migration/review-content
```

The importer only issues unauthenticated GET requests to explicitly linked public paths at madeinhonduras.net. It starts at the homepage, follows each album and photo, checks public visibility, reads both pages of the photo index and then Why/Who. It doesn't guess admin endpoints, fetch unlisted content or access passwords. HTML is cached locally for a repeatable, low-load import. It stops on HTTP errors or incomplete albums rather than silently dropping content.

The default output is `migration/imported-content/`; it never overwrites the curated `content/` directory by default. The output contains Markdown, `archive.json` and an inventory. Compare the output before copying changes; a re-import can overwrite intentional editorial changes if you explicitly target `content`.

To reconstruct image variants on a new machine, the committed variants already suffice. `npm run images` processes new local masters and keeps existing imported variants. `npm run images -- --refresh` regenerates from cached public derivatives (or downloads them if the cache is absent); it therefore needs the old host only when neither a local master nor cached derivative is available.

## URL compatibility

[`migration/legacy-urls.csv`](../migration/legacy-urls.csv) maps **746** homepage, text, album, index and photo paths. Known paths are emitted as real static pages, including:

- `/`, `/pages/why/`, `/pages/who/`
- `/places/<album>/`
- `/places/<album>/content/<photo>/` and its `/lightbox/` suffix
- `/content/<photo>/` and its `/lightbox/` suffix
- `/content/` and `/content/page/2/`

No redirect-rule budget is consumed for these routes. Canonical photo URLs are `/content/<photo>/`; album-context and lightbox URLs use that canonical. Koken's old canonical host was inconsistent (`www` and apex); the new canonical host is `https://madeinhonduras.net`. Configure `www` → apex in Vercel when connecting domains. Trailing-slash pages are exported as `index.html`.

Gallery lightboxes use a shareable `#photo=<slug>` hash, replace the hash when navigating, and close correctly with Back/Escape. Old direct `/lightbox/` links open the viewer over a standalone photo page. Static links still work if JavaScript is disabled.

Old Koken cache-image URLs and Atom/RSS feed endpoints are not recreated; the migrated site uses new hashed image paths and has no publishing feed feature. No admin route is provided. Preserve important externally linked media URLs separately if analytics identify them. Unknown routes return the static 404 page. Sitemap and robots files are generated locally.

## Original backup and safe retirement

Before cutover:

1. Use a secure authenticated server session or the DigitalOcean console to make a complete backup of the Koken database and site directory, including original uploads, custom assets, configuration and themes. Export all relevant DNS records separately. Do not send passwords to the HTTP admin page.
2. Copy that backup off DigitalOcean and out of this repository. Keep two independent copies, record checksums and actually inspect/test the backup. A provider snapshot alone is insufficient for retiring the account.
3. Locate the two broken source files if possible. Compare the full CMS export against the public inventory, especially for private/unlisted material and photos outside albums. Decide explicitly whether any additional material belongs on the public site.
4. Connect the private personal GitHub repository to Vercel, confirm a successful preview build, and review all galleries and pages. Check captions, image quality, mobile navigation, direct URLs, refresh, Back and Escape. Confirm no assets load from DigitalOcean.
5. Check Vercel's current Hobby terms and limits. This was confirmed to be a personal photography archive. Set/check usage notifications and review actual transfer after launch. Keep the original host running during verification.

At cutover (owner action):

6. Add both apex and www to the Vercel project and configure the preferred host. Follow Vercel's current DNS record instructions. Preserve MX/TXT/other unrelated records and existing DNS hosting while testing; changing a web record doesn't require moving nameservers.
7. Verify DNS propagation, HTTPS certificates, redirects and a sample of old URLs from an independent browser/network. Review traffic and missing-page logs. Keep rollback records and the old server available for an observation window you choose.

Only after successful cutover, backup validation and owner approval:

8. Confirm no other service depends on the droplet or DigitalOcean DNS. Then remove the droplet and review separately billed snapshots, volumes and other resources. Powering a droplet off does not by itself retire its billing. Keep the off-provider backups after cancellation.

## Architecture references

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports): build-time rendering and image-loader constraints.
- [React Photo Album](https://react-photo-album.com/documentation): server-generated responsive rows.
- [PhotoSwipe](https://photoswipe.com/): on-demand viewer, touch, zoom and keyboard.
- [Koken's revival article](https://blog.dominey.photography/2026/05/23/the-return-of-koken/): a promising revival, but this archive no longer needs an ongoing CMS/server.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby), [fair use](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage), [platform limits](https://vercel.com/docs/limits).
