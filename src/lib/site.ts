import { readFileSync } from "node:fs";
import { loadContent, routeEntries } from "./content.mjs";
import type { Photo, Album, ImageAsset, ViewerPhoto } from "./types";
export const siteUrl = "https://madeinhonduras.net";
export const content = loadContent();
export const routes = routeEntries(content);
export const images = JSON.parse(
  readFileSync("content/images.json", "utf8"),
) as Record<string, ImageAsset>;
export const photoMap = new Map(
  content.photos.map((photo) => [photo.slug, photo]),
);
export const albumUrl = (album: Album) => `/places/${album.slug}/`;
export const photoUrl = (photo: Photo, album?: Album) =>
  `${album ? albumUrl(album) : "/"}content/${photo.slug}/`;
export function viewerPhotos(album?: Album, slugs?: string[]): ViewerPhoto[] {
  return (slugs ?? album?.photos ?? content.archive)
    .filter((slug) => !!images[photoMap.get(slug)!.id])
    .map((slug) => {
      const photo = photoMap.get(slug)!;
      return {
        ...images[photo.id],
        slug,
        title: photo.title,
        caption: photo.html,
        href: photoUrl(photo, album),
      };
    });
}
