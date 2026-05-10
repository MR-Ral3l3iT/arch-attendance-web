import type { Locale } from "./config";

export const landingCopy = {
  th: {
    metaTitle: "ARCHD Attendance — ดาวน์โหลดแอป & เข้าสู่ระบบ",
    metaDescription:
      "ดาวน์โหลดแอปสำหรับนักศึกษา (Android / iOS) และเข้าใช้งานเว็บสำหรับอาจารย์และผู้ดูแลระบบ",
    subtitle: "ระบบบันทึกการเข้าเรียน",
    login: "เข้าสู่ระบบ",
    badge: "สำหรับนักศึกษาและบุคลากร",
    heroTitle: "ดาวน์โหลดแอปและเข้าใช้งาน ARCHD Attendance",
    heroLead:
      "นักศึกษาใช้แอปมือถือเพื่อเช็คอินเข้าเรียน อาจารย์และผู้ดูแลระบบใช้งานผ่านเว็บเบราว์เซอร์ — เลือกช่องทางที่ตรงกับบทบาทของคุณ",
    studentTitle: "แอปสำหรับนักศึกษา",
    studentDesc:
      "รองรับ Android และ iOS ติดตั้งแล้วล็อกอินด้วยบัญชีที่ได้รับจากสถาบัน",
    playSublabel: "ดาวน์โหลดจาก Play Store",
    apkLabel: "ดาวน์โหลด APK",
    apkSublabel: "สำหรับติดตั้งโดยตรง (ถ้าอนุญาต)",
    storeSublabel: "ดาวน์โหลดสำหรับ iPhone / iPad",
    testflightSublabel: "ทดสอบก่อนเปิดตัว (ถ้ามี)",
    comingSoonHint:
      "ลิงก์จะเปิดเมื่อพร้อมให้บริการ — สอบถามผู้ดูแลระบบของสถาบันได้",
    staffTitle: "เว็บสำหรับอาจารย์และผู้ดูแล",
    staffDesc:
      "จัดการตารางเรียน รายงานการเข้าเรียน และการตั้งค่าระบบผ่านหน้าเว็บ — ไม่ต้องติดตั้งแอป",
    staffBullet1: "อาจารย์: บันทึกและติดตามการเข้าเรียนตามคาบเรียน",
    staffBullet2: "ผู้ดูแล: จัดการข้อมูลหลักสูตร อาคาร ตาราง และผู้ใช้",
    staffCta: "ไปหน้าเข้าสู่ระบบ",
    footerPrivacy: "นโยบายความเป็นส่วนตัว",
    footerTerms: "เงื่อนไขการใช้งาน",
    footerDeletion: "การลบข้อมูลผู้ใช้งาน",
  },
  en: {
    metaTitle: "ARCHD Attendance — Download apps & sign in",
    metaDescription:
      "Download the student app (Android / iOS) and use the web portal for teachers and administrators.",
    subtitle: "Attendance recording system",
    login: "Sign in",
    badge: "For students and staff",
    heroTitle: "Download the app and use ARCHD Attendance",
    heroLead:
      "Students check in with the mobile app; teachers and admins use the browser — pick the option that matches your role.",
    studentTitle: "Student app",
    studentDesc:
      "Android and iOS supported. Sign in with the account issued by your institution.",
    playSublabel: "Get it on Google Play",
    apkLabel: "Download APK",
    apkSublabel: "Direct install (if permitted)",
    storeSublabel: "Download for iPhone / iPad",
    testflightSublabel: "Beta testing (if available)",
    comingSoonHint:
      "Links will go live when available — contact your institution’s IT or admin team.",
    staffTitle: "Web for teachers & admins",
    staffDesc:
      "Manage schedules, attendance reports, and settings in the browser — no app install required.",
    staffBullet1: "Teachers: record and monitor attendance by class session.",
    staffBullet2: "Admins: manage courses, buildings, schedules, and users.",
    staffCta: "Go to sign-in",
    footerPrivacy: "Privacy policy",
    footerTerms: "Terms of use",
    footerDeletion: "Account & data deletion",
  },
} as const;

export function getLandingCopy(locale: Locale) {
  return landingCopy[locale];
}
