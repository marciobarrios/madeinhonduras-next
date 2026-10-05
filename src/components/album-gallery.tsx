import ServerPhotoAlbum from "react-photo-album/server";
import { GalleryViewer } from "./gallery-viewer";
import type { ViewerPhoto } from "@/lib/types";
export function AlbumGallery({ photos }: { photos: ViewerPhoto[] }) {
  return (
    <GalleryViewer photos={photos}>
      <ServerPhotoAlbum
        componentsProps={{ container: { className: "[&_a]:overflow-hidden [&_a]:rounded-lg [&_a]:bg-sky [&_a:focus-visible]:outline-ink" } }}
        layout="rows"
        breakpoints={[280, 480, 768, 1024, 1200]}
        photos={photos.map((p) => ({
          ...p,
          alt: p.title,
          label: `View ${p.title}`,
          key: p.slug,
        }))}
        targetRowHeight={(width) => (width < 600 ? width / 3.2 : 260)}
        spacing={(width) => (width < 600 ? 6 : 16)}
        rowConstraints={(width) => ({ maxPhotos: width < 600 ? 2 : 3 })}
        sizes={{
          size: "calc(100vw - 64px)",
          sizes: [
            { viewport: "(min-width: 1280px)", size: "1184px" },
            { viewport: "(min-width: 1024px)", size: "calc(100vw - 96px)" },
            { viewport: "(max-width: 640px)", size: "calc(100vw - 40px)" },
          ],
        }}
        render={{
          link: (props, { index }) => <a {...props} data-photo-index={index} />,
        }}
      />
    </GalleryViewer>
  );
}
