import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Apple, GraduationCap, LayoutDashboard, Smartphone } from "lucide-react";
import { ArchdNavbarBrand } from "@/components/brand/ArchdNavbarBrand";
import { AppStoreIcon, GooglePlayIcon } from "@/components/icons/StoreIcons";
import { landingDownloads } from "@/lib/landing-config";
import { getLandingCopy } from "@/lib/i18n/landing";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { LocaleSwitcherLinks } from "@/components/i18n/LocaleSwitcherLinks";
import { getLegalShell } from "@/lib/i18n/shell";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: l } = await params;
  if (!isLocale(l)) return {};
  const t = getLandingCopy(l);
  return { title: t.metaTitle, description: t.metaDescription };
}

function DownloadButton({
  href,
  label,
  sublabel,
  leading,
}: {
  href: string;
  label: string;
  sublabel?: string;
  leading: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-card transition hover:border-primary/30 hover:shadow-card-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        {leading}
      </span>
      <span className="min-w-0 text-left">
        <span className="block font-semibold text-gray-900">{label}</span>
        {sublabel ? <span className="block text-sm text-gray-500">{sublabel}</span> : null}
      </span>
    </a>
  );
}

function ComingSoonRow({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3 text-gray-500">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Smartphone className="h-5 w-5" aria-hidden />
      </span>
      <span>
        <span className="block font-medium text-gray-600">{label}</span>
        <span className="text-sm">{hint}</span>
      </span>
    </div>
  );
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;
  const t = getLandingCopy(locale);
  const shell = getLegalShell(locale);
  const prefix = `/${locale}`;
  const {
    androidPlayUrl,
    androidApkUrl,
    iosAppStoreUrl,
    iosTestFlightUrl,
  } = landingDownloads;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 via-white to-white">
      <header className="border-b border-gray-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <ArchdNavbarBrand subtitle={t.subtitle} href={prefix} />
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <LocaleSwitcherLinks pathname={prefix} langTh={shell.langTh} langEn={shell.langEn} />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              {t.login}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-primary/15">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              {t.badge}
            </p>
            <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t.heroTitle}
            </h1>
            <p className="mt-4 text-pretty text-lg text-gray-600">{t.heroLead}</p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card-md sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <Smartphone className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.studentTitle}</h2>
                  <p className="mt-1 text-sm text-gray-600">{t.studentDesc}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {androidPlayUrl ? (
                  <DownloadButton
                    href={androidPlayUrl}
                    label="Google Play"
                    sublabel={t.playSublabel}
                    leading={<GooglePlayIcon className="text-[#34A853]" />}
                  />
                ) : (
                  <ComingSoonRow label="Google Play" hint={t.comingSoonHint} />
                )}

                {androidApkUrl ? (
                  <DownloadButton
                    href={androidApkUrl}
                    label={t.apkLabel}
                    sublabel={t.apkSublabel}
                    leading={<Smartphone className="h-6 w-6 text-gray-700" aria-hidden />}
                  />
                ) : null}

                {iosAppStoreUrl ? (
                  <DownloadButton
                    href={iosAppStoreUrl}
                    label="App Store"
                    sublabel={t.storeSublabel}
                    leading={<AppStoreIcon className="text-gray-900" />}
                  />
                ) : (
                  <ComingSoonRow label="App Store (iOS)" hint={t.comingSoonHint} />
                )}

                {iosTestFlightUrl ? (
                  <DownloadButton
                    href={iosTestFlightUrl}
                    label="TestFlight"
                    sublabel={t.testflightSublabel}
                    leading={<Apple className="h-6 w-6 text-gray-800" aria-hidden />}
                  />
                ) : null}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-card-md sm:p-8">
              <div>
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-info-50 text-info">
                    <LayoutDashboard className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t.staffTitle}</h2>
                    <p className="mt-1 text-sm text-gray-600">{t.staffDesc}</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {t.staffBullet1}
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {t.staffBullet2}
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                {t.staffCta}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50/80 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500 sm:px-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              href={`${prefix}/privacy`}
              className="underline-offset-2 hover:text-gray-800 hover:underline"
            >
              {t.footerPrivacy}
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link
              href={`${prefix}/terms`}
              className="underline-offset-2 hover:text-gray-800 hover:underline"
            >
              {t.footerTerms}
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link
              href={`${prefix}/data-deletion`}
              className="underline-offset-2 hover:text-gray-800 hover:underline"
            >
              {t.footerDeletion}
            </Link>
          </nav>
          <p className="mt-4">© {new Date().getFullYear()} ARCHD Attendance</p>
        </div>
      </footer>
    </div>
  );
}
