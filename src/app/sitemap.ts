import type { MetadataRoute } from "next";
import { routes, siteUrl } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl + "/" },
    ...routes
      .filter(
        (e) => !e.lightbox && !(e.kind === "photo" && e.path[0] === "places"),
      )
      .map((e) => ({ url: `${siteUrl}/${e.path.join("/")}/` })),
  ];
}
