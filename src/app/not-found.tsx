import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { shell, heading, textLink } from "@/components/ui";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={`${shell} pt-12`}>
        <h1 className={`${heading} mb-6 text-5xl`}>This place isn’t here.</h1>
        <p>
          The link may have changed. Explore the collection to find your way
          back.
        </p>
        <Link className={`${textLink} mt-6`} href="/">
          View all places
        </Link>
      </main>
    </>
  );
}
