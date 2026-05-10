import Link from "next/link";
import { alternateLocalePath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  /** Current path including locale prefix, e.g. `/th`, `/en/privacy` */
  pathname: string;
  langTh: string;
  langEn: string;
};

/**
 * Language toggle without client hooks — avoids Next.js devtools / RSC manifest issues
 * when navigating between localized segments.
 */
export function LocaleSwitcherLinks({ pathname, langTh, langEn }: Props) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isTh = normalized.startsWith("/th");

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium shadow-sm"
      role="navigation"
      aria-label="Language"
    >
      <Link
        href={alternateLocalePath(normalized, "th")}
        className={cn(
          "rounded px-1.5 py-0.5 transition",
          isTh ? "bg-primary-50 font-semibold text-primary" : "text-gray-600 hover:text-gray-900"
        )}
        hrefLang="th"
      >
        {langTh}
      </Link>
      <span className="select-none text-gray-300" aria-hidden>
        |
      </span>
      <Link
        href={alternateLocalePath(normalized, "en")}
        className={cn(
          "rounded px-1.5 py-0.5 transition",
          !isTh ? "bg-primary-50 font-semibold text-primary" : "text-gray-600 hover:text-gray-900"
        )}
        hrefLang="en"
      >
        {langEn}
      </Link>
    </div>
  );
}
