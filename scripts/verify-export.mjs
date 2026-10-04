import { readFileSync, existsSync } from "node:fs";
import { load } from "cheerio";
import { loadContent, routeEntries } from "../src/lib/content.mjs";
const paths = [
  "/",
  ...routeEntries(loadContent()).map((e) => "/" + e.path.join("/") + "/"),
];
let checked = 0;
for (const route of paths) {
  const file = "out" + route + "index.html";
  if (!existsSync(file)) throw Error("Missing exported route: " + route);
  const $ = load(readFileSync(file, "utf8"));
  for (const img of $("img").toArray()) {
    const el = $(img);
    for (const url of [
      el.attr("src"),
      ...(el.attr("srcset") || "")
        .split(",")
        .map((v) => v.trim().split(" ")[0]),
    ].filter(Boolean)) {
      if (!url.startsWith("/images/"))
        throw Error("Unexpected image source: " + url);
      if (!existsSync("out" + url)) throw Error("Missing image: " + url);
      checked++;
    }
  }
}
console.log(
  `Verified ${paths.length} exported content routes and ${checked} local image references.`,
);
