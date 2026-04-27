import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function attendanceStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ON_TIME:     "มาตรงเวลา",
    LATE:        "มาสาย",
    ABSENT:      "ขาดเรียน",
    LEAVE:       "ลา",
    NOT_CHECKED: "ยังไม่เช็คชื่อ",
  };
  return map[status] ?? status;
}

export function leaveStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:  "รอการอนุมัติ",
    APPROVED: "อนุมัติแล้ว",
    REJECTED: "ปฏิเสธ",
  };
  return map[status] ?? status;
}

export function getDayLabel(day: string): string {
  const map: Record<string, string> = {
    MONDAY:    "จันทร์",
    TUESDAY:   "อังคาร",
    WEDNESDAY: "พุธ",
    THURSDAY:  "พฤหัสบดี",
    FRIDAY:    "ศุกร์",
    SATURDAY:  "เสาร์",
    SUNDAY:    "อาทิตย์",
  };
  return map[day] ?? day;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN:   "ผู้ดูแลระบบ",
    TEACHER: "อาจารย์",
    STUDENT: "นักศึกษา",
  };
  return map[role] ?? role;
}

/** ชื่ออาจารย์จาก payload จริงของ API (ชื่ออยู่ที่ Teacher; User ใน Prisma ไม่มี firstName/lastName) */
/** นับจำนวนรายการจาก API ที่คืนได้ทั้ง `T[]` และ `{ data, meta }` */
export function totalFromApiList<T>(
  payload: { data: T[]; meta?: { total?: number } } | T[] | null | undefined
): number {
  if (payload == null) return 0;
  if (Array.isArray(payload)) return payload.length;
  const total = payload.meta?.total;
  if (typeof total === "number") return total;
  return Array.isArray(payload.data) ? payload.data.length : 0;
}

export function formatTeacherName(
  teacher:
    | {
        firstName?: string;
        lastName?: string;
        user?: { firstName?: string; lastName?: string };
      }
    | null
    | undefined
): string {
  if (!teacher) return "—";
  const fn = teacher.firstName ?? teacher.user?.firstName;
  const ln = teacher.lastName ?? teacher.user?.lastName;
  const s = `${fn ?? ""} ${ln ?? ""}`.trim();
  return s || "—";
}
