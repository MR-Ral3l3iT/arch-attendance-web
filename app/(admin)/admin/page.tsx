"use client";

import Link from "next/link";
import { LayoutDashboard, CalendarClock, FileText, Plus, CalendarDays, Settings } from "lucide-react";
import { PageHeader, Card, Alert, Button, Badge } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import type { LeaveRequest, Semester, Holiday } from "@/types";

export default function AdminDashboardPage() {
  const pending = useFetch<LeaveRequest[]>("/leave-requests/pending");
  const semesters = useFetch<Semester[]>("/semesters");
  const activeSemester = (semesters.data ?? []).find((s) => s.isActive);
  const holidaysUrl = activeSemester ? `/system-settings/holidays?semesterId=${activeSemester.id}` : null;
  const holidays = useFetch<Holiday[]>(holidaysUrl);

  const anyError = [pending, semesters, holidays].find((q) => q.error);
  const pendingCount = pending.data?.length ?? 0;
  const holidayCount = holidays.data?.length ?? 0;
  const hasActiveSemester = !!activeSemester;

  return (
    <div>
      <PageHeader
        title="ภาพรวมผู้ดูแลระบบ"
        subtitle="งานที่ต้องจัดการวันนี้และทางลัดไปยังหน้าสำคัญ"
        icon={<LayoutDashboard size={20} />}
      />

      {anyError && (
        <Alert variant="warning" className="mb-4">
          บางข้อมูลโหลดไม่สำเร็จ: {anyError.error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">คำขอลารอดำเนินการ</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
              <p className="text-xs text-gray-400 mt-1">รออนุมัติจากครู/ผู้ดูแล</p>
            </div>
            <FileText size={18} className="text-warning" />
          </div>
          <div className="mt-3">
            <Link href="/admin/reports">
              <Button variant="outline" size="sm">ไปหน้ารายงาน</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">วันหยุดในเทอมปัจจุบัน</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{hasActiveSemester ? holidayCount : "—"}</p>
              <p className="text-xs text-gray-400 mt-1">
                {hasActiveSemester ? `${activeSemester?.name} (${activeSemester?.academicYear.name})` : "ยังไม่ได้ตั้งเทอมที่ active"}
              </p>
            </div>
            <CalendarDays size={18} className="text-primary" />
          </div>
          <div className="mt-3">
            <Link href="/admin/settings">
              <Button variant="outline" size="sm">จัดการวันหยุด</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">สถานะเทอม</p>
              <div className="mt-2">
                <Badge variant={hasActiveSemester ? "success" : "warning"}>
                  {hasActiveSemester ? "มีเทอมที่ active" : "ยังไม่มีเทอม active"}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {hasActiveSemester
                  ? `เริ่ม ${new Date(activeSemester.startDate).toISOString().slice(0, 10)}`
                  : "ไปที่เมนูปีการศึกษาเพื่อเปิดใช้งานเทอม"}
              </p>
            </div>
            <CalendarClock size={18} className="text-success" />
          </div>
          <div className="mt-3">
            <Link href="/admin/academic">
              <Button variant="outline" size="sm">จัดการปีการศึกษา</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href="/admin/teachers" className="rounded-lg border border-gray-200 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-gray-800">เพิ่ม/จัดการอาจารย์</p>
              <p className="text-xs text-gray-500 mt-1">เปิดหน้าจัดการอาจารย์</p>
            </Link>
            <Link href="/admin/students" className="rounded-lg border border-gray-200 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-gray-800">เพิ่ม/นำเข้านักศึกษา</p>
              <p className="text-xs text-gray-500 mt-1">รองรับ import template</p>
            </Link>
            <Link href="/admin/courses" className="rounded-lg border border-gray-200 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-gray-800">จัดการรายวิชา</p>
              <p className="text-xs text-gray-500 mt-1">เปิด/แก้ไขรายวิชา</p>
            </Link>
            <Link href="/admin/schedules" className="rounded-lg border border-gray-200 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium text-gray-800">จัดตารางเรียน</p>
              <p className="text-xs text-gray-500 mt-1">ผูกห้อง เวลา และอาจารย์</p>
            </Link>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">แนะนำการใช้งานสำหรับ Admin</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p className="flex items-start gap-2">
              <Plus size={14} className="mt-0.5 text-primary" />
              เริ่มต้นภาคเรียนใหม่: ตรวจสอบเทอม active และเพิ่มวันหยุดก่อนเปิดใช้งานจริง
            </p>
            <p className="flex items-start gap-2">
              <Settings size={14} className="mt-0.5 text-primary" />
              ตั้งค่าระบบเช็คชื่อกลางที่ `ตั้งค่าระบบ` แล้วค่อยให้อาจารย์ override รายวิชา
            </p>
            <p className="flex items-start gap-2">
              <FileText size={14} className="mt-0.5 text-primary" />
              ติดตามคำขอลาและรายงานทุกวันเพื่อลดงานค้างก่อนสิ้นสัปดาห์
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
