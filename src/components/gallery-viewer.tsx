"use client";
import { useEffect, useRef, type ReactNode } from "react";
import type { ViewerPhoto } from "@/lib/types";
import type PhotoSwipeLightbox from "photoswipe/lightbox";

/** Progressive enhancement: every photograph remains a normal static link without JS. */
export function GalleryViewer({
  photos,
  children,
  initialSlug,
}: {
  photos: ViewerPhoto[];
  children: ReactNode;
  initialSlug?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    let lightbox: PhotoSwipeLightbox | undefined;
    let cancelled = false;
    let opening: Promise<PhotoSwipeLightbox | undefined> | undefined;
    let ownsEntry = false;
    let closingFromHistory = false;
    const hashSlug = () =>
      new URLSearchParams(location.hash.slice(1)).get("photo");
    const clearHash = () =>
      history.replaceState(
        history.state,
        "",
        location.pathname + location.search,
      );
    async function prepare() {
      if (lightbox) return lightbox;
      if (opening) return opening;
      opening = import("photoswipe/lightbox").then(({ default: Lightbox }) => {
        if (cancelled) return;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        lightbox = new Lightbox({
          dataSource: photos.map((p) => ({
            src: p.src,
            width: p.width,
            height: p.height,
            alt: p.title,
            srcset: p.srcSet.map((v) => `${v.src} ${v.width}w`).join(", "),
          })),
          pswpModule: () => import("photoswipe"),
          bgOpacity: 1,
          showHideAnimationType: reduced ? "none" : "fade",
          showAnimationDuration: reduced ? 0 : 180,
          hideAnimationDuration: reduced ? 0 : 160,
          padding: { top: 64, bottom: 126, left: 24, right: 24 },
          loop: false,
          returnFocus: true,
          trapFocus: true,
          closeTitle: "Close photo viewer",
          zoomTitle: "Zoom photograph",
          arrowPrevTitle: "Previous photograph",
          arrowNextTitle: "Next photograph",
        });
        lightbox.on("uiRegister", () => {
          lightbox!.pswp!.ui!.registerElement({
            name: "caption",
            order: 9,
            isButton: false,
            appendTo: "root",
            onInit: (el, pswp) => {
              el.setAttribute("aria-live", "polite");
              pswp.on("change", () => {
                const p = photos[pswp.currIndex];
                const title = document.createElement("strong");
                title.textContent = p.title;
                const caption = document.createElement("div");
                caption.innerHTML = p.caption;
                const link = document.createElement("a");
                link.href = p.href;
                link.textContent = "Photo page";
                el.replaceChildren(title, caption, link);
              });
            },
          });
        });
        lightbox.on("bindEvents", () => {
          lightbox!.pswp!.element!.dataset.ready = "true";
        });
        lightbox.on("change", () => {
          if (!lightbox?.pswp || closingFromHistory) return;
          const slug = photos[lightbox.pswp.currIndex].slug;
          history.replaceState(
            history.state,
            "",
            `${location.pathname}${location.search}#photo=${encodeURIComponent(slug)}`,
          );
        });
        lightbox.on("close", () => {
          if (closingFromHistory) return;
          if (ownsEntry) {
            ownsEntry = false;
            history.back();
          } else clearHash();
        });
        lightbox.on("destroy", () => {
          closingFromHistory = false;
        });
        lightbox.init();
        return lightbox;
      });
      return opening;
    }
    async function open(index: number, fromHistory = false) {
      if (index < 0) return;
      const box = await prepare();
      if (!box || cancelled) return;
      if (box.pswp) {
        box.pswp.goTo(index);
        return;
      }
      closingFromHistory = false;
      ownsEntry = fromHistory ? !!history.state?.mihViewer : true;
      if (!fromHistory)
        history.pushState(
          { ...history.state, mihViewer: true },
          "",
          `${location.pathname}${location.search}#photo=${encodeURIComponent(photos[index].slug)}`,
        );
      box.loadAndOpen(index);
    }
    function click(event: MouseEvent) {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        "a[data-photo-index]",
      );
      if (
        !anchor ||
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      anchor.focus();
      void open(Number(anchor.dataset.photoIndex));
    }
    function pop() {
      const slug = hashSlug();
      if (!slug) {
        closingFromHistory = true;
        ownsEntry = false;
        lightbox?.pswp?.close();
      } else
        void open(
          photos.findIndex((p) => p.slug === slug),
          true,
        );
    }
    container?.addEventListener("click", click);
    window.addEventListener("popstate", pop);
    const slug = hashSlug();
    if (slug)
      void open(
        photos.findIndex((p) => p.slug === slug),
        true,
      );
    else if (initialSlug)
      void open(photos.findIndex((p) => p.slug === initialSlug));
    return () => {
      cancelled = true;
      closingFromHistory = true;
      container?.removeEventListener("click", click);
      window.removeEventListener("popstate", pop);
      lightbox?.destroy();
    };
  }, [photos, initialSlug]);
  return <div ref={root}>{children}</div>;
}
