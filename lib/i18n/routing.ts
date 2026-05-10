import type { Locale } from "./config";

/** Swap /th ↔ /en prefix; expects paths like /th/privacy or /en */
export function alternateLocalePath(pathname: string, target: Locale): string {
  if (pathname.startsWith("/th")) {
    const rest = pathname.slice(3) || "/";
    return `/${target}${rest === "/" ? "" : rest}`;
  }
  if (pathname.startsWith("/en")) {
    const rest = pathname.slice(3) || "/";
    return `/${target}${rest === "/" ? "" : rest}`;
  }
  return `/${target}`;
}
