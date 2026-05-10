import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { getLegalShell } from "@/lib/i18n/shell";
import { LocaleSwitcherLinks } from "@/components/i18n/LocaleSwitcherLinks";

type LegalPageShellProps = {
  locale: Locale;
  /** Full path for language toggle, e.g. `/th/privacy` */
  pathname: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
  className?: string;
};

export function LegalPageShell({
  locale,
  pathname,
  title,
  lastUpdated,
  children,
  className,
}: LegalPageShellProps) {
  const shell = getLegalShell(locale);
  const prefix = `/${locale}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 via-white to-white">
      <header className="border-b border-gray-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
          <Link
            href={prefix}
            className="inline-flex min-w-0 items-center gap-2 rounded-lg text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{shell.backHome}</span>
          </Link>
          <div className="flex flex-1 items-center justify-center gap-2 sm:flex-none">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <BookOpenCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-gray-900">ARCHD Attendance</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LocaleSwitcherLinks pathname={pathname} langTh={shell.langTh} langEn={shell.langEn} />
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg px-1 text-sm font-medium text-primary hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {shell.login}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm text-gray-500">
          {shell.lastUpdatedPrefix} {lastUpdated}
        </p>
        <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
        <div
          className={cn(
            "mt-8 text-[0.9375rem] leading-relaxed text-gray-700 sm:text-base",
            "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-gray-900",
            "[&_h2:first-child]:mt-0",
            "[&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_strong]:font-semibold [&_strong]:text-gray-900",
            className
          )}
        >
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50/80 py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-gray-500 sm:px-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              href={`${prefix}/privacy`}
              className="underline-offset-2 hover:text-gray-800 hover:underline"
            >
              {shell.footerPrivacy}
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link
              href={`${prefix}/terms`}
              className="underline-offset-2 hover:text-gray-800 hover:underline"
            >
              {shell.footerTerms}
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link
              href={`${prefix}/data-deletion`}
              className="underline-offset-2 hover:text-gray-800 hover:underline"
            >
              {shell.footerDeletion}
            </Link>
          </nav>
          <p className="mt-4">© {new Date().getFullYear()} ARCHD Attendance</p>
        </div>
      </footer>
    </div>
  );
}
