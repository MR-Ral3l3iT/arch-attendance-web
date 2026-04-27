"use client";

import { Users, GraduationCap, BookOpen, FileText, LayoutDashboard } from "lucide-react";
import { PageHeader, StatCard, Alert } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { totalFromApiList } from "@/lib/utils";
import type { PaginatedResponse, Student, Teacher, Course, LeaveRequest } from "@/types";

export default function AdminDashboardPage() {
  const students  = useFetch<Student[] | PaginatedResponse<Student>>("/students?page=1&limit=1");
  const teachers  = useFetch<Teacher[] | PaginatedResponse<Teacher>>("/teachers?page=1&limit=1");
  const courses   = useFetch<Course[]>("/courses");
  const pending   = useFetch<LeaveRequest[]>("/leave-requests/pending");

  const stats = [
    {
      title: "นักศึกษาทั้งหมด",
      value: students.loading ? "..." : students.data == null ? "—" : totalFromApiList(students.data),
      icon: <Users size={20} />,
      accent: "primary" as const,
    },
    {
      title: "อาจารย์ทั้งหมด",
      value: teachers.loading ? "..." : teachers.data == null ? "—" : totalFromApiList(teachers.data),
      icon: <GraduationCap size={20} />,
      accent: "info" as const,
    },
    {
      title: "รายวิชาที่เปิดสอน",
      value: courses.loading ? "..." : (courses.data?.length ?? "—"),
      icon: <BookOpen size={20} />,
      accent: "success" as const,
    },
    {
      title: "คำขอลารอดำเนินการ",
      value: pending.loading ? "..." : (pending.data?.length ?? "—"),
      icon: <FileText size={20} />,
      accent: "warning" as const,
    },
  ];

  const anyError = [students, teachers, courses, pending].find((q) => q.error);

  return (
    <div>
      <PageHeader title="ภาพรวมระบบ" subtitle="สรุปข้อมูลระบบบันทึกการเข้าเรียน" icon={<LayoutDashboard size={20} />} />

      {anyError && (
        <Alert variant="warning" className="mb-4">
          บางข้อมูลโหลดไม่สำเร็จ: {anyError.error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>
    </div>
  );
}
