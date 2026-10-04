import Link from "next/link";
export function SiteHeader({ active = "Places" }: { active?: string }) {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        Made in Honduras
      </Link>
      <nav aria-label="Main navigation">
        {[
          ["Places", "/"],
          ["Why", "/pages/why/"],
          ["Who", "/pages/who/"],
        ].map(([name, href]) => (
          <Link
            key={href}
            href={href}
            aria-current={active === name ? "page" : undefined}
          >
            {name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
