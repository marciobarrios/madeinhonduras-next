import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Icon, heading, shell } from "@/components/ui";
import { content, images, photoMap, albumUrl } from "@/lib/site";

export const metadata = {
  alternates: { canonical: "/" },
  openGraph: { images: [images[photoMap.get(content.albums[0].cover)!.id].src] },
};

export default function Home() {
  const featured = content.albums[0];
  const cover = photoMap.get(featured.cover)!;
  const img = images[cover.id];
  const photoCount = content.photos.filter((photo) => images[photo.id]).length;
  return (
    <>
      <SiteHeader />
      <main id="main" className={shell}>
        <section className="grid items-center gap-5 pt-4 pb-10 sm:grid-cols-2 sm:gap-10 sm:pt-14 sm:pb-24 lg:gap-20 lg:pt-18 lg:pb-28">
          <div>
            <h1 className={`${heading} max-w-[9.5ch] text-[clamp(44px,6vw,78px)] text-ocean`}>A little closer to Honduras.</h1>
            <p className="mt-4 max-w-[33ch] text-lg leading-relaxed text-slate sm:mt-7 sm:text-xl">A personal collection of places, people and moments. Photographs by Marcio Barrios.</p>
            <a href="#places" className="mt-7 hidden min-h-12 w-fit items-center gap-3 rounded-full bg-ocean px-6 py-3 text-base text-white hover:bg-ocean-deep motion-safe:transition-[background-color,transform] motion-safe:active:scale-[0.97] sm:inline-flex">Explore the places <Icon name="down" className="size-4" /></a>
          </div>
          <Link href={albumUrl(featured)} prefetch={false} aria-label={`Open the ${featured.title} album`} className="group relative mx-auto mt-4 block w-[89%] max-w-[490px] rotate-3 rounded-[5px] shadow-[0_12px_38px_#23334b16,0_1px_4px_#23334b0a] outline-offset-8 before:absolute before:inset-0 before:-z-10 before:-rotate-6 before:rounded-[5px] before:bg-[#e4ebf3] before:shadow-[0_3px_10px_#23334b08] motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:rotate-1 sm:mt-0 sm:w-full">
            <div className="relative rounded-[5px] bg-white p-2.5 pb-0 sm:p-3 sm:pb-0">
            <Image src={img.src} alt={cover.title} width={img.width} height={img.height} sizes="(max-width: 640px) 85vw, (max-width: 1100px) 44vw, 466px" loading="eager" fetchPriority="high" className="aspect-[3/2] w-full sm:aspect-[4/3] rounded-[2px] object-cover" />
            <div className="flex min-h-14 items-center justify-between gap-3 px-2 sm:min-h-16">
              <span className="font-display text-base font-medium tracking-tight text-ink sm:text-lg">A moment in Roatán</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-sky text-ocean"><Icon name="right" className="size-4" /></span>
            </div>
            </div>
          </Link>
          <a href="#places" className="mt-3 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-ocean px-6 py-3 text-white motion-safe:active:scale-[0.98] sm:hidden">Explore the places <Icon name="down" className="size-4" /></a>
        </section>
        <section id="places" className="scroll-mt-8" aria-labelledby="places-heading">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 sm:mb-9">
            <h2 id="places-heading" className={`${heading} text-[32px] sm:text-[40px]`}>Places to linger.</h2>
            <p className="text-sm text-slate">{content.albums.length} places, {photoCount} photographs</p>
          </div>
          <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3">
            {content.albums.map((album) => {
              const photo = photoMap.get(album.cover)!;
              const image = images[photo.id];
              return (
                <article className="place group min-w-0" key={album.slug}>
                  <Link className="place-image block overflow-hidden rounded-xl bg-sky motion-safe:transition-transform motion-safe:duration-200 motion-safe:active:scale-[0.985]" href={albumUrl(album)} aria-label={`Explore ${album.title}`} prefetch={false}>
                    <Image src={image.src} alt={photo.title} width={image.width} height={image.height} sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc((100vw - 92px) / 2), (max-width: 1280px) calc((100vw - 152px) / 3), 376px" className="aspect-[3/2] w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.025]" />
                  </Link>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <h3 className="font-display text-[23px] leading-[1.2] font-medium tracking-[-0.035em]"><Link href={albumUrl(album)} prefetch={false} className="block min-h-11 hover:text-ocean">{album.title}</Link></h3>
                    <span className="flex shrink-0 items-center gap-1.5 pt-1 text-sm text-slate" aria-label={`${album.photos.length} photographs`}><Icon name="photos" className="size-4" />{album.photos.length}</span>
                  </div>
                  <p className="mt-1 max-w-[45ch] text-base leading-relaxed text-slate">{album.summary}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
