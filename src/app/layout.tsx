import type { Metadata } from "next";
import "@fontsource/pt-sans/latin-400.css";
import "@fontsource/pt-sans/latin-700.css";
import "react-photo-album/rows.css";
import "photoswipe/style.css";
import "./globals.css";
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
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <footer className="site-footer">
          <p>
            Photographs by{" "}
            <a href="https://marciobarrios.com">Marcio Barrios</a>
          </p>
          <p>
            © {new Date().getFullYear()} Marcio Barrios. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
