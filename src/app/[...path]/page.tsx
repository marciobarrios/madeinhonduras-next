import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AlbumGallery } from "@/components/album-gallery";
import { GalleryViewer } from "@/components/gallery-viewer";
import { Icon, shell, heading, prose, backLink, textLink } from "@/components/ui";

const albumBottom = "mt-12 flex items-start justify-between gap-6 border-t border-ink/10 pt-6 text-base [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:gap-2 [&_a]:text-ocean [&_a:last-child]:text-right";
import {
  routes,
  content,
  images,
  photoMap,
  albumUrl,
  photoUrl,
  viewerPhotos,
} from "@/lib/site";
export const dynamicParams = false;
export function generateStaticParams() {
  return routes.map(({ path }) => ({ path }));
}
async function getEntry(params: Promise<{ path: string[] }>) {
  const { path } = await params;
  return routes.find((entry) => entry.path.join("/") === path.join("/"));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const entry = await getEntry(params);
  if (!entry) return {};
  const { photo, album, page } = entry;
  const image = photo
    ? images[photo.id]
    : album
      ? images[photoMap.get(album.cover)!.id]
      : page?.image
        ? images[page.image]
        : undefined;
  const title =
    photo?.title || album?.title || page?.title || "All photographs";
  const description = photo?.body || album?.summary || page?.body.slice(0, 160);
  return {
    title,
    description,
    alternates: {
      canonical: photo ? photoUrl(photo) : `/${entry.path.join("/")}/`,
    },
    openGraph: {
      title,
      description,
      ...(image
        ? {
            images: [
              {
                url: image.src,
                width: image.width,
                height: image.height,
                alt: title,
              },
            ],
          }
        : {}),
    },
  };
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const entry = await getEntry(params);
  if (!entry) notFound();
  if (entry.kind === "page") {
    const page = entry.page!;
    const img = page.image ? images[page.image] : undefined;
    return (
      <>
        <SiteHeader active={page.title} />
        <main id="main" className={`${shell} pt-8 sm:pt-14 !max-w-[820px]`}>
          <h1 className={`${heading} mb-8 text-5xl text-ocean sm:text-7xl`}>{page.title}</h1>
          <div
            className={prose}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          {img ? (
            <Image
              className="mt-9 w-full rounded-2xl"
              src={img.src}
              alt="Marcio Barrios in Beijing"
              width={img.width}
              height={img.height}
              sizes="(max-width: 800px) calc(100vw - 32px), 740px"
            />
          ) : null}
          <Link className={`${textLink} mt-8`} href="/">
            Explore the places
          </Link>
        </main>
      </>
    );
  }
  if (entry.kind === "archive") {
    const current = entry.archivePage!;
    const slugs = content.archive.slice((current - 1) * 100, current * 100);
    return (
      <>
        <SiteHeader />
        <main id="main" className={`${shell} pt-5 sm:pt-8`}>
          <Link className={backLink} href="/">
            <Icon name="left" className="size-4" /> All places
          </Link>
          <div className="grid gap-5 pt-6 pb-8 sm:grid-cols-2 sm:gap-12 sm:pt-9 sm:pb-12">
            <div>
              <h1 className={`${heading} text-4xl sm:text-6xl`}>All photographs</h1>
              <p className="photo-count mt-4 text-sm text-slate tabular-nums">
                {content.photos.length} photographs · Page {current} of{" "}
                {Math.ceil(content.photos.length / 100)}
              </p>
            </div>
          </div>
          <AlbumGallery photos={viewerPhotos(undefined, slugs)} />
          <div className={albumBottom}>
            {current > 1 ? (
              <Link href="/content/">Previous page</Link>
            ) : (
              <span />
            )}
            {current * 100 < content.photos.length ? (
              <Link href={`/content/page/${current + 1}/`}>Next page</Link>
            ) : (
              <span />
            )}
          </div>
        </main>
      </>
    );
  }
  const album = entry.album!;
  if (entry.kind === "album") {
    const index = content.albums.indexOf(album);
    const next = content.albums[(index + 1) % content.albums.length];
    return (
      <>
        <SiteHeader />
        <main id="main" className={`${shell} pt-5 sm:pt-8`}>
          <Link className={backLink} href="/">
            <Icon name="left" className="size-4" /> All places
          </Link>
          <div className="grid gap-5 pt-6 pb-8 sm:grid-cols-2 sm:gap-12 sm:pt-9 sm:pb-12">
            <div>
              <h1 className={`${heading} max-w-[18ch] text-[40px] text-ocean sm:text-[60px]`}>{album.title}</h1>
              <p className="photo-count mt-4 text-sm text-slate tabular-nums">{album.photos.length} photographs</p>
            </div>
            <div className="max-w-[54ch] text-base leading-relaxed text-slate sm:pt-1 sm:text-lg">
              <p>{album.summary}</p>
              <details className="mt-2 [&[open]_summary]:mb-4">
                <summary className="w-fit min-h-11 cursor-pointer py-2 text-sm text-ocean underline decoration-ocean/30 underline-offset-4">About this place</summary>
                <div
                  className={prose}
                  dangerouslySetInnerHTML={{ __html: album.html }}
                />
              </details>
            </div>
          </div>
          <AlbumGallery photos={viewerPhotos(album)} />
          <div className={albumBottom}>
            <Link href="/"><Icon name="left" className="size-4 shrink-0" /> All places</Link>
            <Link href={albumUrl(next)}>Next place: {next.title} <Icon name="right" className="size-4 shrink-0" /></Link>
          </div>
        </main>
      </>
    );
  }
  const photo = entry.photo!;
  const img = images[photo.id];
  const photos = viewerPhotos(album);
  const slugs = album?.photos ?? content.archive;
  const index = slugs.indexOf(photo.slug);
  return (
    <>
      <SiteHeader />
      <main id="main" className={`${shell} pt-6 !max-w-[1200px]`}>
        <div className="mb-6 flex items-center justify-between gap-4 text-sm text-slate tabular-nums [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:text-ocean">
          <Link href={album ? albumUrl(album) : "/content/"}>
            Back to {album?.title ?? "all photographs"}
          </Link>
          <span>
            {index + 1} / {slugs.length}
          </span>
        </div>
        <GalleryViewer
          photos={photos}
          initialSlug={entry.lightbox ? photo.slug : undefined}
        >
          <a
            className="single-photo block overflow-hidden rounded-xl bg-sky [&_img]:mx-auto [&_img]:max-h-[76vh] [&_img]:w-auto [&_img]:object-contain"
            href={`${photoUrl(photo, album)}lightbox/`}
            data-photo-index={index}
            aria-label={`View ${photo.title} in full screen`}
          >
            <Image
              src={img.src}
              alt={photo.title}
              width={img.width}
              height={img.height}
              sizes="(max-width: 800px) calc(100vw - 32px), 1100px"
              priority
            />
          </a>
        </GalleryViewer>
        <div className="flex flex-col justify-between gap-4 pt-7 sm:flex-row sm:gap-8">
          <div>
            <h1 className={`${heading} mb-3 text-3xl`}>{photo.title}</h1>
            <div
              className={prose}
              dangerouslySetInnerHTML={{ __html: photo.html }}
            />
          </div>
          {photo.exif.length ? (
            <p className="pt-2 text-sm text-slate sm:text-right">{photo.exif.join(" · ")}</p>
          ) : null}
        </div>
        <nav className={albumBottom} aria-label="Photo navigation">
          {index > 0 ? (
            <Link href={photoUrl(photoMap.get(slugs[index - 1])!, album)}>
              Previous photograph
            </Link>
          ) : (
            <span />
          )}
          {index < slugs.length - 1 ? (
            <Link href={photoUrl(photoMap.get(slugs[index + 1])!, album)}>
              Next photograph
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </>
  );
}
