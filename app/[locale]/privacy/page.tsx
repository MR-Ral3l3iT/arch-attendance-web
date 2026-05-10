import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { PrivacyPolicyDocument } from "@/components/legal/PrivacyPolicyDocument";
import { privacyMeta } from "@/lib/i18n/legal-meta";
import { isLocale, type Locale } from "@/lib/i18n/config";

const TITLE: Record<Locale, string> = {
  th: "นโยบายความเป็นส่วนตัว (Privacy Policy)",
  en: "Privacy policy",
};

const UPDATED: Record<Locale, string> = {
  th: "10 พฤษภาคม พ.ศ. 2569",
  en: "May 10, 2026",
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l } = await params;
  if (!isLocale(l)) return {};
  const m = privacyMeta[l];
  return { title: m.title, description: m.description };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale = l as Locale;

  return (
    <LegalPageShell
      locale={locale}
      pathname={`/${locale}/privacy`}
      title={TITLE[locale]}
      lastUpdated={UPDATED[locale]}
    >
      <PrivacyPolicyDocument locale={locale} />
    </LegalPageShell>
  );
}
