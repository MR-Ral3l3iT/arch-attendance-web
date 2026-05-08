"use client";

import { useState } from "react";
import { Download, BarChart3 } from "lucide-react";
import {
  PageHeader, Button, Card, Select, Table, Alert, StatCard, Pagination,
} from "@/components/ui";

const LIMIT = 20;
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { Schedule, Semester, AttendanceSummary, AttendanceRecord } from "@/types";

interface ScheduleReport {
  schedule: Schedule;
  summary: AttendanceSummary[];
  totalSessions: number;
}

interface StudentScheduleReport {
  schedule: {
    id: string;
    totalClasses: number;
  };
  students: Array<{
    student: {
      id: string;
      code: string;
      firstName: string;
      lastName: string;
    };
    onTime: number;
    late: number;
    absent: number;
    leave: number;
    attendanceRate: number;
  }>;
}

function toExcelSheetName(raw: string): string {
  const cleaned = raw
    .replace(/[\[\]\*\/\\\?\:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || "Attendance").slice(0, 31);
}

export default function AdminReportsPage() {
  const { data: semesters } = useFetch<Semester[]>("/semesters");
  const { data: schedules } = useFetch<Schedule[]>("/schedules");

  const [filterSemester, setSemester] = useState("");
  const [filterSchedule, setSchedule] = useState("");
  const [exporting, setExporting]     = useState(false);
  const [page, setPage]               = useState(1);

  const semOptions   = (semesters ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.academicYear.name})` }));
  const schedOptions = (schedules ?? [])
    .filter((s) => !filterSemester || s.section.semester.id === filterSemester)
    .map((s) => ({ value: s.id, label: `${s.section.course.code} ${s.section.course.name} — ${s.section.name}` }));

  const reportUrl = filterSchedule ? `/reports/schedule/${filterSchedule}/students` : null;
  const { data: report, loading, error } = useFetch<StudentScheduleReport | ScheduleReport>(reportUrl);
  const summaryRows: AttendanceSummary[] =
    report && "students" in report
      ? report.students.map((r) => ({
          studentId: r.student.id,
          studentCode: r.student.code,
          studentName: `${r.student.firstName} ${r.student.lastName}`,
          total: r.onTime + r.late + r.absent + r.leave,
          onTime: r.onTime,
          late: r.late,
          absent: r.absent,
          leave: r.leave,
          attendanceRate: r.attendanceRate,
        }))
      : Array.isArray((report as ScheduleReport | null)?.summary)
        ? (report as ScheduleReport).summary
        : [];
  const totalSessions =
    report && "students" in report
      ? report.schedule.totalClasses
      : (report as ScheduleReport | null)?.totalSessions ?? 0;

  async function handleExport() {
    setExporting(true);
    try {
      const { utils, writeFile } = await import("xlsx");
      let rows: Record<string, string | number>[] = [];

      // ถ้าเลือกรายวิชาแล้ว ให้ export ตามตารางรายงานบนหน้าจอ (ไม่เสี่ยงได้ไฟล์ว่างจาก endpoint records)
      if (filterSchedule) {
        rows = summaryRows.map((r) => ({
          รหัสนักศึกษา: r.studentCode,
          ชื่อ: r.studentName,
          ตรงเวลา: r.onTime,
          สาย: r.late,
          ขาด: r.absent,
          ลา: r.leave,
          "เข้าเรียน(%)": Number(r.attendanceRate.toFixed(1)),
        }));
      } else {
        const params = new URLSearchParams();
        if (filterSemester) params.set("semesterId", filterSemester);
        const { data } = await api.get<AttendanceRecord[]>(`/reports/export?${params.toString()}`);
        rows = data.map((r: AttendanceRecord) => ({
          รหัสนักศึกษา: r.student.code,
          ชื่อ: `${r.student.firstName} ${r.student.lastName}`,
          วันที่: r.classDate,
          เวลาเช็คชื่อ: r.checkInTime ?? "—",
          สถานะ: r.status,
        }));
      }

      if (rows.length === 0) {
        toast.error("ไม่พบข้อมูลสำหรับ Export");
        return;
      }

      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      const selectedSchedule = (schedules ?? []).find((s) => s.id === filterSchedule);
      const courseName = selectedSchedule
        ? `${selectedSchedule.section.course.code}-${selectedSchedule.section.name}`
        : "Attendance";
      utils.book_append_sheet(wb, ws, toExcelSheetName(courseName));
      writeFile(wb, `attendance_report_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success("Export สำเร็จ");
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setExporting(false); }
  }

  return (
    <div>
      <PageHeader title="รายงานการเข้าเรียน" icon={<BarChart3 size={20} />}
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download size={14} />}
            onClick={handleExport} loading={exporting}>
            Export Excel
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-3">
          <Select options={[{ value: "", label: "ทุกภาคการศึกษา" }, ...semOptions]}
            value={filterSemester} onChange={(e) => { setSemester(e.target.value); setSchedule(""); }}
            className="w-56" />
          <Select options={[{ value: "", label: "เลือกรายวิชา / กลุ่ม" }, ...schedOptions]}
            value={filterSchedule} onChange={(e) => setSchedule(e.target.value)}
            className="w-72" />
        </div>
      </Card>

      {!filterSchedule && (
        <Card>
          <p className="text-sm text-gray-400 text-center py-8">เลือกรายวิชาเพื่อดูรายงาน</p>
        </Card>
      )}

      {filterSchedule && error && <Alert variant="danger">{error}</Alert>}

      {filterSchedule && report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatCard title="จำนวนคาบทั้งหมด" value={totalSessions} accent="primary" />
            <StatCard title="นักศึกษาทั้งหมด" value={summaryRows.length} accent="info" />
            <StatCard title="เฉลี่ยเข้าเรียน"
              value={summaryRows.length > 0
                ? `${(summaryRows.reduce((s, r) => s + r.attendanceRate, 0) / summaryRows.length).toFixed(1)}%`
                : "—"}
              accent="success" />
            <StatCard title="ขาดเรียนรวม"
              value={summaryRows.reduce((s, r) => s + r.absent, 0)}
              accent="warning" />
          </div>

          <Card>
            <Table
              data={summaryRows.slice((page - 1) * LIMIT, page * LIMIT)} keyField="studentId" loading={loading}
              emptyMessage="ไม่มีข้อมูลนักศึกษา"
              columns={[
                { key: "studentCode", header: "รหัส", render: (r) => r.studentCode },
                { key: "name", header: "ชื่อ-นามสกุล", render: (r) => r.studentName },
                { key: "onTime", header: "ตรงเวลา", render: (r) => r.onTime.toString() },
                { key: "late", header: "สาย", render: (r) => r.late.toString() },
                { key: "absent", header: "ขาด", render: (r) => r.absent.toString() },
                { key: "leave", header: "ลา", render: (r) => r.leave.toString() },
                { key: "rate", header: "% เข้าเรียน", render: (r) => (
                  <span className={r.attendanceRate < 80 ? "text-danger font-semibold" : "text-success font-semibold"}>
                    {r.attendanceRate.toFixed(1)}%
                  </span>
                )},
              ]}
            />
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={Math.ceil(summaryRows.length / LIMIT)}
                total={summaryRows.length}
                limit={LIMIT}
                onPageChange={setPage}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
