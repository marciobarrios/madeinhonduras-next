import type { Content, RouteEntry } from "./types";
export function markdown(text: string): string;
export function loadContent(): Content;
export function routeEntries(content: Content): RouteEntry[];
