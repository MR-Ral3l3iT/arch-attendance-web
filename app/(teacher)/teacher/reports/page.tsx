"use client";

import { useState } from "react";
import { Download, BarChart3 } from "lucide-react";
import { PageHeader, Button, Card, Select, Table, Alert, StatCard, Pagination } from "@/components/ui";

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

export default function TeacherReportsPage() {
  const { data: schedules } = useFetch<Schedule[]>("/schedules");
  const { data: semesters } = useFetch<Semester[]>("/semesters");

  const [filterSemester, setSem]      = useState("");
  const [filterSchedule, setSched]    = useState("");
  const [exporting, setExporting]     = useState(false);
  const [page, setPage]               = useState(1);

  const semOptions   = (semesters ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.academicYear.name})` }));
  const schedOptions = (schedules ?? [])
    .filter((s) => !filterSemester || s.section.semester.id === filterSemester)
    .map((s) => ({ value: s.id, label: `${s.section.course.code} ${s.section.course.name} — ${s.section.name}` }));

  const reportUrl = filterSchedule ? `/reports/schedule/${filterSchedule}` : null;
  const { data: report, loading, error } = useFetch<ScheduleReport>(reportUrl);

  async function handleExport() {
    if (!filterSchedule) { toast.error("กรุณาเลือกรายวิชาก่อน"); return; }
    setExporting(true);
    try {
      const { data } = await api.get<AttendanceRecord[]>(`/reports/export?scheduleId=${filterSchedule}`);
      const { utils, writeFile } = await import("xlsx");
      const ws = utils.json_to_sheet(
        data.map((r: AttendanceRecord) => ({
          รหัสนักศึกษา: r.student.code,
          ชื่อ: `${r.student.firstName} ${r.student.lastName}`,
          วันที่: r.classDate,
          เวลาเช็คชื่อ: r.checkInTime ?? "—",
          สถานะ: r.status,
          หมายเหตุ: r.note ?? "",
        }))
      );
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Attendance");
      writeFile(wb, `attendance_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success("Export สำเร็จ");
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setExporting(false); }
  }

  return (
    <div>
      <PageHeader title="รายงานการเข้าเรียน" icon={<BarChart3 size={20} />}
        actions={<Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={handleExport} loading={exporting}>Export Excel</Button>}
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-3">
          <Select options={[{ value: "", label: "ทุกภาคการศึกษา" }, ...semOptions]}
            value={filterSemester} onChange={(e) => { setSem(e.target.value); setSched(""); }} className="w-52" />
          <Select options={[{ value: "", label: "เลือกรายวิชา / กลุ่ม" }, ...schedOptions]}
            value={filterSchedule} onChange={(e) => setSched(e.target.value)} className="w-72" />
        </div>
      </Card>

      {!filterSchedule && <Card><p className="text-sm text-gray-400 text-center py-8">เลือกรายวิชาเพื่อดูรายงาน</p></Card>}
      {filterSchedule && error && <Alert variant="danger">{error}</Alert>}

      {filterSchedule && report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatCard title="คาบทั้งหมด"   value={report.totalSessions} accent="primary" />
            <StatCard title="นักศึกษา"      value={report.summary.length} accent="info" />
            <StatCard title="เฉลี่ยเข้าเรียน"
              value={report.summary.length > 0
                ? `${(report.summary.reduce((s, r) => s + r.attendanceRate, 0) / report.summary.length).toFixed(1)}%`
                : "—"}
              accent="success" />
            <StatCard title="ขาดรวม" value={report.summary.reduce((s, r) => s + r.absent, 0)} accent="warning" />
          </div>
          <Card>
            <Table data={report.summary.slice((page - 1) * LIMIT, page * LIMIT)} keyField="studentId" loading={loading} emptyMessage="ไม่มีข้อมูล"
              columns={[
                { key: "studentCode", header: "รหัส", render: (r) => r.studentCode },
                { key: "name", header: "ชื่อ-นามสกุล", render: (r) => r.studentName },
                { key: "onTime", header: "ตรงเวลา", render: (r) => r.onTime.toString() },
                { key: "late",   header: "สาย",     render: (r) => r.late.toString() },
                { key: "absent", header: "ขาด",     render: (r) => r.absent.toString() },
                { key: "leave",  header: "ลา",      render: (r) => r.leave.toString() },
                { key: "rate",   header: "% เข้าเรียน", render: (r) => (
                  <span className={r.attendanceRate < 80 ? "text-danger font-semibold" : "text-success font-semibold"}>
                    {r.attendanceRate.toFixed(1)}%
                  </span>
                )},
              ]}
            />
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={Math.ceil(report.summary.length / LIMIT)}
                total={report.summary.length}
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
