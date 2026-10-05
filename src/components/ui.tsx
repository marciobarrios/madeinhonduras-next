import type { SVGProps } from "react";

export const shell = "mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12";
export const heading = "font-display font-semibold tracking-[-0.045em] text-balance leading-[1.05]";
export const textLink = "inline-flex min-h-11 items-center gap-2 text-ocean underline decoration-ocean/30 underline-offset-4 hover:decoration-ocean";
export const backLink = "inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm text-ink shadow-[0_1px_5px_#23334b0a] hover:bg-sky motion-safe:transition-colors";
export const prose = "max-w-[68ch] leading-[1.75] text-slate [&_p+p]:mt-5 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:pl-1 [&_a]:text-ocean [&_a]:underline [&_a]:underline-offset-4";

type IconName = "places" | "heart" | "person" | "left" | "right" | "down" | "photos";

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    places: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    person: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    left: <path d="m14 6-6 6 6 6M8 12h13" />,
    right: <path d="m10 6 6 6-6 6M3 12h13" />,
    down: <path d="m6 10 6 6 6-6M12 3v13" />,
    photos: <><rect x="6" y="3" width="15" height="15" rx="3" /><path d="M3 7v11a3 3 0 0 0 3 3h11m-11-9 4-4 7 7" /></>,
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

export function FlagMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 32" width="40" height="32" fill="none" className={className} aria-hidden="true">
      <rect width="40" height="32" rx="7" fill="currentColor" />
      <path d="M0 10h40v12H0z" fill="white" />
      {[ [14,13], [26,13], [20,16], [14,19], [26,19] ].map(([x,y]) => <path key={`${x}-${y}`} d="m0-1.7.5 1.1 1.2.2-.9.9.2 1.2L0 1.1l-1 .6.2-1.2-.9-.9 1.2-.2Z" transform={`translate(${x} ${y})`} fill="currentColor" />)}
    </svg>
  );
}
