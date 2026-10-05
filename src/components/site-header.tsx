import Link from "next/link";
import { FlagMark, Icon, shell } from "./ui";
export function SiteHeader({ active = "Places" }: { active?: string }) {
  return (
    <header className={`${shell} flex min-h-20 items-center justify-between gap-6 py-5 sm:min-h-28`}>
      <Link className="flex min-h-11 items-center gap-3 text-ocean" href="/" aria-label="Made in Honduras, home">
        <FlagMark className="shrink-0 -rotate-6" />
        <span className="font-display text-[19px] leading-[1.05] font-semibold tracking-[-0.04em] sm:text-[21px]">Made in<br />Honduras</span>
      </Link>
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-ink/5 bg-white/95 px-4 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_#23334b05] backdrop-blur-xl sm:static sm:flex sm:gap-2 sm:rounded-full sm:border-0 sm:bg-sky/60 sm:p-1.5 sm:shadow-none sm:backdrop-blur-none">
        {[
          { name: "Places", href: "/", icon: "places" as const },
          { name: "Why", href: "/pages/why/", icon: "heart" as const },
          { name: "Who", href: "/pages/who/", icon: "person" as const },
        ].map(({ name, href, icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active === name ? "page" : undefined}
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-5 py-1.5 text-xs text-slate hover:text-ocean aria-[current=page]:bg-sky aria-[current=page]:text-ocean sm:min-h-11 sm:flex-row sm:gap-2 sm:rounded-full sm:px-5 sm:text-[15px] sm:aria-[current=page]:bg-white sm:aria-[current=page]:shadow-[0_2px_6px_#23334b08]"
          >
            <Icon name={icon} className="size-5 sm:size-4" />
            {name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
