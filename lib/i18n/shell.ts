import type { Locale } from "./config";

export const legalShell = {
  th: {
    backHome: "หน้าแรก",
    login: "เข้าสู่ระบบ",
    lastUpdatedPrefix: "อัปเดตล่าสุด:",
    footerPrivacy: "นโยบายความเป็นส่วนตัว",
    footerTerms: "เงื่อนไขการใช้งาน",
    footerDeletion: "การลบข้อมูลผู้ใช้งาน",
    langTh: "ไทย",
    langEn: "English",
  },
  en: {
    backHome: "Home",
    login: "Sign in",
    lastUpdatedPrefix: "Last updated:",
    footerPrivacy: "Privacy policy",
    footerTerms: "Terms of use",
    footerDeletion: "Account & data deletion",
    langTh: "ไทย",
    langEn: "English",
  },
} as const;

export function getLegalShell(locale: Locale) {
  return legalShell[locale];
}
