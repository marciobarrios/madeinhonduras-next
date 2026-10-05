# Design direction: a pocket photo album

Made in Honduras is Marcio Barrios's personal photo archive, not a travel service. Keep Places, Why and Who, all nine albums in their original order, short introductions, and the original photographs and captions.

## Tokens

- Cloud `#f7f9fc`: cool page background.
- Print `#ffffff`: photographic borders and controls.
- Ink `#23334b`: primary text.
- Ocean `#2455cf`: identity, selected navigation and primary action.
- Slate `#58677d`: secondary text.
- Sky `#e8eefb`: quiet selected surfaces.

Locally hosted Bricolage Grotesque gives the headings and wordmark the slightly irregular, friendly character of a personal collection. Locally hosted PT Sans, inherited from the original site, keeps the descriptions familiar and readable. Headings use a 32/40/56/76px scale; body text is 17px, navigation 15px, metadata 14px. Left-align text, keep prose below 68 characters per line, and balance headings.

## Layout

The desktop opening pairs a short personal introduction with an oversized stack of real photographic prints. The album collection below remains an unboxed three-column grid with landscape covers, place names and counts. On mobile the introduction and print stack become a compact vertical opening, album covers fill the width, and a persistent bottom navigation holds the three sections.

```text
Desktop
Made in Honduras                         Places  Why  Who

A little closer                / photograph /
 to Honduras.                 /   photograph  /
Personal introduction         /_______________/
[Explore the places]              West Bay, Roatan

Places to linger                       9 places / 182 photos
[Roatan photograph]  [Cayos photograph]  [Pico photograph]
Title / photo count  Title / photo count Title / photo count
Short introduction   Short introduction Short introduction

Mobile                     Album                    Viewer
Made in Honduras           Made in Honduras          [Zoom]  1 of 12  [Close]
A little closer            [All places]
to Honduras.               Roatan
Personal introduction      Introduction               full photograph
[ photographic prints ]    [photo] [photo]            (swipe / pinch / drag)
[Explore the places]       [photo] [photo]
Places to linger           [photo] [photo]            Caption / Photo page
[album cover]                                        [thumbnail strip]
[ Places | Why | Who ]     [ Places | Why | Who ]
```

## Review before implementation

A tropical landing page with travel badges, large decorative maps and handwritten annotations would compete with the archive and make it feel like a tourism campaign. Remove those devices. Spend the playfulness on one stack of prints and the character of the headings. Use the existing Roatan cover rather than inventing a destination or changing album data. The print stack leads directly into that album; it is not a carousel that makes a reader wait.

Keep the browser's scrolling behavior, real links, useful static pages and existing URLs. Tailwind utilities carry the layout and states; CSS is limited to global tokens/base rules and PhotoSwipe's generated elements. No remote fonts or image requests.

## Interaction principles

- Mobile navigation sits above the home indicator, has visible text and 44px or larger targets, and identifies the active section.
- Album rows show more than one photo on phones without changing photo order or cropping full-screen images.
- PhotoSwipe handles continuous touch tracking, horizontal swipes, pinch/double-tap zoom and vertical dismissal. Do not add a competing gesture handler.
- Add a horizontal thumbnail strip with visible selection and keyboard-accessible buttons. Load nearby full-size photos, not the whole album.
- Full-screen controls and captions respect safe areas. Captions remain available, and a photo-page link gives access to complete content.
- Keyboard arrows, Escape, focus restoration, browser Back/Forward and shareable photo hashes continue to work.
- Reduced motion removes opening, closing, zoom and navigation animation. Hover treatments only apply to a fine pointer; press feedback is subtle.
- No autoplay, scroll-triggered reveals, fabricated dates, search, filters, account features or new content sections.

## Verification

Run the repository checks, full static export, and Playwright against `out/`. Inspect desktop and mobile screenshots. Cover navigation, local-only assets, no-JavaScript links, direct legacy routes, browser history, thumbnail navigation, touch swipe/dismiss/zoom, reduced motion and accessibility. Browser emulation provides evidence about browser behavior; physical iOS Safari remains a separate device check.
