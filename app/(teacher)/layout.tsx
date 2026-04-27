"use client";

import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Sidebar, type NavSection } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const navSections: NavSection[] = [
  {
    items: [
      { href: "/teacher", label: "ภาพรวม", icon: LayoutDashboard as LucideIcon, exact: true },
    ],
  },
  {
    title: "การเรียนการสอน",
    items: [
      { href: "/teacher/attendance", label: "เช็คชื่อ", icon: ClipboardCheck as LucideIcon },
      { href: "/teacher/leave-requests", label: "คำขอลา", icon: FileText as LucideIcon },
    ],
  },
  {
    title: "ระบบ",
    items: [
      { href: "/teacher/reports", label: "รายงาน", icon: BarChart3 as LucideIcon },
      { href: "/teacher/settings", label: "ตั้งค่าวิชา", icon: Settings as LucideIcon },
    ],
  },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sections={navSections} appName="ARCHD Attendance" />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
