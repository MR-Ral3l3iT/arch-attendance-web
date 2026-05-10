import type { Locale } from "./config";

export const privacyMeta: Record<Locale, { title: string; description: string }> = {
  th: {
    title: "นโยบายความเป็นส่วนตัว — ARCHD Attendance",
    description:
      "นโยบายความเป็นส่วนตัวสำหรับบริการ ARCHD Attendance — การเก็บ ใช้ และปกป้องข้อมูลส่วนบุคคล",
  },
  en: {
    title: "Privacy policy — ARCHD Attendance",
    description:
      "Privacy policy for ARCHD Attendance — how we collect, use, and protect personal data.",
  },
};

export const termsMeta: Record<Locale, { title: string; description: string }> = {
  th: {
    title: "เงื่อนไขการใช้งาน — ARCHD Attendance",
    description:
      "ข้อกำหนดและเงื่อนไขการใช้บริการ ARCHD Attendance สำหรับนักศึกษา อาจารย์ และผู้ดูแลระบบ",
  },
  en: {
    title: "Terms of use — ARCHD Attendance",
    description:
      "Terms and conditions for using ARCHD Attendance for students, teachers, and administrators.",
  },
};

export const dataDeletionMeta: Record<Locale, { title: string; description: string }> = {
  th: {
    title: "การลบข้อมูลของผู้ใช้งาน — ARCHD Attendance",
    description:
      "แนวทางการขอลบบัญชีและข้อมูลส่วนบุคคลในระบบ ARCHD Attendance สำหรับผู้ใช้แอปและเว็บ",
  },
  en: {
    title: "Account & data deletion — ARCHD Attendance",
    description:
      "How to request deletion of your account and personal data in ARCHD Attendance (app and web).",
  },
};
