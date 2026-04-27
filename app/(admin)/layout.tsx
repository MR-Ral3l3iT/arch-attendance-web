"use client";

import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Sidebar, type NavSection } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard as LucideIcon, exact: true },
    ],
  },
  {
    title: "วิชาการ",
    items: [
      { href: "/admin/academic", label: "ปีการศึกษา / ภาคเรียน", icon: CalendarDays as LucideIcon },
      { href: "/admin/buildings", label: "อาคาร / ห้องเรียน", icon: Building2 as LucideIcon },
    ],
  },
  {
    title: "บุคลากร",
    items: [
      { href: "/admin/teachers", label: "อาจารย์", icon: GraduationCap as LucideIcon },
      { href: "/admin/students", label: "นักศึกษา", icon: Users as LucideIcon },
    ],
  },
  {
    title: "รายวิชา",
    items: [
      { href: "/admin/courses", label: "รายวิชา / กลุ่มเรียน", icon: BookOpen as LucideIcon },
      { href: "/admin/schedules", label: "ตารางเรียน", icon: Clock as LucideIcon },
    ],
  },
  {
    title: "ระบบ",
    items: [
      { href: "/admin/reports", label: "รายงาน", icon: BarChart3 as LucideIcon },
      { href: "/admin/settings", label: "ตั้งค่าระบบ", icon: Settings as LucideIcon },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
