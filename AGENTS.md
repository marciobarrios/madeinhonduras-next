# Made in Honduras

A personal photo archive. Preserve the small information architecture: Places, Why, Who; short album introductions and photographs.

- Read `README.md` and `docs/MIGRATION.md` before modifying content or import tools.
- Content lives in Markdown with YAML frontmatter under `content/`. Keep existing public slugs stable. Do not treat filenames as captions.
- `migration/inventory.json` is the original read-only source snapshot. Do not rewrite it during routine editing.
- This site is a static export. No CMS, database, environment secrets, server actions, API routes, runtime image service, or remote image dependencies.
- `public/images` contains committed, metadata-free display variants. Never add originals, backups, `.env`, credentials, admin URLs or source screenshots to Git.
- For new/changed images, use `npm run images`; keep local masters in ignored `.migration-cache/` or outside the repository.
- Use `npm run check`, `npm run build` and `npm run test:e2e` after meaningful changes. Browser tests run against the actual exported `out/` directory.
- Do not deploy, change DNS, modify the old Koken installation, or delete DigitalOcean resources unless the user explicitly requests it.
- The default Next.js image optimizer is unavailable in a static export. The custom loader must resolve only to existing local variants.
- Preserve progressive enhancement: gallery links work without JavaScript; lightbox controls support keyboard, mobile and browser history. Respect reduced motion.
