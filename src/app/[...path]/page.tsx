import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AlbumGallery } from "@/components/album-gallery";
import { GalleryViewer } from "@/components/gallery-viewer";
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
        <main id="main" className="site-main text-page">
          <h1>{page.title}</h1>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          {img ? (
            <Image
              className="portrait"
              src={img.src}
              alt="Marcio Barrios in Beijing"
              width={img.width}
              height={img.height}
              sizes="(max-width: 800px) calc(100vw - 32px), 740px"
            />
          ) : null}
          <Link className="text-link" href="/">
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
        <main id="main" className="site-main album-page">
          <Link className="back-link" href="/">
            All places
          </Link>
          <div className="album-intro">
            <div>
              <h1>All photographs</h1>
              <p className="photo-count">
                {content.photos.length} photographs · Page {current} of{" "}
                {Math.ceil(content.photos.length / 100)}
              </p>
            </div>
          </div>
          <AlbumGallery photos={viewerPhotos(undefined, slugs)} />
          <div className="album-bottom">
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
  if (entry.kind === "photo" && entry.photo!.status === "missing-source") {
    return (
      <>
        <SiteHeader />
        <main id="main" className="site-main text-page">
          <h1>{entry.photo!.title}</h1>
          <p>
            This photograph is currently unavailable. Its original file could
            not be recovered from the previous website.
          </p>
          <Link className="text-link" href="/">
            Explore the places
          </Link>
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
        <main id="main" className="site-main album-page">
          <Link className="back-link" href="/">
            All places
          </Link>
          <div className="album-intro">
            <div>
              <h1>{album.title}</h1>
              <p className="photo-count">{album.photos.length} photographs</p>
            </div>
            <div className="album-description">
              <p>{album.summary}</p>
              <details>
                <summary>About this place</summary>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: album.html }}
                />
              </details>
            </div>
          </div>
          <AlbumGallery photos={viewerPhotos(album)} />
          <div className="album-bottom">
            <Link href="/">All places</Link>
            <Link href={albumUrl(next)}>Next place: {next.title}</Link>
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
      <main id="main" className="site-main photo-page">
        <div className="photo-nav">
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
            className="single-photo"
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
        <div className="photo-details">
          <div>
            <h1>{photo.title}</h1>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: photo.html }}
            />
          </div>
          {photo.exif.length ? (
            <p className="exif">{photo.exif.join(" · ")}</p>
          ) : null}
        </div>
        <nav className="album-bottom" aria-label="Photo navigation">
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
