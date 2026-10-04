import ServerPhotoAlbum from "react-photo-album/server";
import { GalleryViewer } from "./gallery-viewer";
import type { ViewerPhoto } from "@/lib/types";
export function AlbumGallery({ photos }: { photos: ViewerPhoto[] }) {
  return (
    <GalleryViewer photos={photos}>
      <ServerPhotoAlbum
        layout="rows"
        breakpoints={[360, 600, 900, 1200]}
        photos={photos.map((p) => ({
          ...p,
          alt: p.title,
          label: `View ${p.title}`,
          key: p.slug,
        }))}
        targetRowHeight={(width) => (width < 600 ? 240 : 270)}
        spacing={(width) => (width < 600 ? 10 : 20)}
        rowConstraints={(width) => ({ maxPhotos: width < 600 ? 1 : 3 })}
        sizes={{
          size: "calc(100vw - 64px)",
          sizes: [
            { viewport: "(min-width: 1440px)", size: "1376px" },
            { viewport: "(max-width: 600px)", size: "calc(100vw - 32px)" },
          ],
        }}
        render={{
          link: (props, { index }) => <a {...props} data-photo-index={index} />,
        }}
      />
    </GalleryViewer>
  );
}
