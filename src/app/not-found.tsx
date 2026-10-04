import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="site-main text-page">
        <h1>This place isn’t here.</h1>
        <p>
          The link may have changed. Explore the collection to find your way
          back.
        </p>
        <Link className="text-link" href="/">
          View all places
        </Link>
      </main>
    </>
  );
}
