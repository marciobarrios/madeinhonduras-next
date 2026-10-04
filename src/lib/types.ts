export type Variant = {
  src: string;
  width: number;
  height: number;
  bytes: number;
};
export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  srcSet: Variant[];
};
export type Photo = {
  status?: "missing-source";
  slug: string;
  id: string;
  title: string;
  width: number;
  height: number;
  sourceUrl: string;
  sourcePage: string;
  exif: string[];
  body: string;
  html: string;
};
export type Album = {
  slug: string;
  title: string;
  summary: string;
  order: number;
  cover: string;
  photos: string[];
  body: string;
  html: string;
};
export type Page = {
  slug: string;
  title: string;
  image?: string;
  body: string;
  html: string;
};
export type Content = {
  albums: Album[];
  photos: Photo[];
  pages: Page[];
  archive: string[];
};
export type RouteEntry = {
  path: string[];
  kind: "album" | "photo" | "page" | "archive";
  archivePage?: number;
  album?: Album;
  photo?: Photo;
  page?: Page;
  lightbox?: boolean;
};
export type ViewerPhoto = ImageAsset & {
  slug: string;
  title: string;
  caption: string;
  href: string;
};
