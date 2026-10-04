import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { content, images, photoMap, albumUrl } from "@/lib/site";
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    images: [images[photoMap.get(content.albums[0].cover)!.id].src],
  },
};
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="site-main">
        <section className="home-intro">
          <h1>Honduras, an unspoiled paradise.</h1>
          <p>
            A personal collection of places, people and moments.
            <br />
            Photographs by Marcio Barrios.
          </p>
        </section>
        <div className="places-grid" aria-label="Places in Honduras">
          {content.albums.map((album, index) => {
            const photo = photoMap.get(album.cover)!;
            const img = images[photo.id];
            return (
              <article className="place" key={album.slug}>
                <Link
                  className="place-image"
                  href={albumUrl(album)}
                  aria-label={`Explore ${album.title}`}
                  prefetch={false}
                >
                  <Image
                    src={img.src}
                    alt={photo.title}
                    width={img.width}
                    height={img.height}
                    sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1000px) calc((100vw - 88px) / 2), (max-width: 1440px) calc((100vw - 112px) / 3), 443px"
                    loading={index < 3 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </Link>
                <div className="place-heading">
                  <h2>
                    <Link href={albumUrl(album)} prefetch={false}>
                      {album.title}
                    </Link>
                  </h2>
                  <span>{album.photos.length} photos</span>
                </div>
                <p>{album.summary}</p>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
