import type { Metadata, Viewport } from "next";
import { FlagMark, shell } from "@/components/ui";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/pt-sans/latin-400.css";
import "@fontsource/pt-sans/latin-700.css";
import "react-photo-album/rows.css";
import "photoswipe/style.css";
import "./globals.css";
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f7f9fc" };
export const metadata: Metadata = {
  metadataBase: new URL("https://madeinhonduras.net"),
  title: {
    default: "Made in Honduras — photographs by Marcio Barrios",
    template: "%s — Made in Honduras",
  },
  description:
    "Honduras, an unspoiled paradise. Photographs of its people, islands and wild places by Marcio Barrios.",
  authors: [{ name: "Marcio Barrios", url: "https://marciobarrios.com" }],
  openGraph: { siteName: "Made in Honduras", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", creator: "@marciobarrios" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-cloud font-body text-[17px] leading-relaxed text-ink antialiased">
        <a className="fixed top-3 left-3 z-50 -translate-y-32 rounded-lg bg-white px-4 py-3 text-ink focus:translate-y-0" href="#main">
          Skip to content
        </a>
        {children}
        <footer className={`${shell} mt-20 flex flex-col items-start justify-between gap-5 pt-8 pb-[calc(110px+env(safe-area-inset-bottom))] text-sm text-slate sm:mt-28 sm:flex-row sm:items-center sm:pb-10`}>
          <div className="flex items-center gap-3"><FlagMark className="w-7 text-ocean" /><p>Seen with love. Shared by <a className="underline underline-offset-4 hover:text-ocean" href="https://marciobarrios.com">Marcio Barrios</a>.</p></div>
          <p className="text-xs">© {new Date().getFullYear()} Marcio Barrios. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
