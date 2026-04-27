"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import { PageHeader, Card, Select, Alert, Badge } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { getDayLabel } from "@/lib/utils";
import type { Schedule, Semester } from "@/types";

export default function TeacherAttendancePage() {
  const router  = useRouter();
  const [filterSemester, setSem] = useState("");

  const { data: semesters }  = useFetch<Semester[]>("/semesters");
  const { data: schedules, loading, error } = useFetch<Schedule[]>("/schedules");

  const semOptions = (semesters ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.academicYear.name})` }));

  const filtered = (schedules ?? []).filter((s) => {
    if (filterSemester && s.section.semester.id !== filterSemester) return false;
    return true;
  });

  function handleSelect(s: Schedule) {
    router.push(`/teacher/attendance/${s.id}/summary`);
  }

  return (
    <div>
      <PageHeader title="เช็คชื่อ" subtitle="เลือกวิชาเพื่อดูสรุปการเข้าเรียนรายนักศึกษา" icon={<ClipboardCheck size={20} />} />

      <Card className="mb-4">
        <Select options={[{ value: "", label: "ทุกภาคการศึกษา" }, ...semOptions]}
          value={filterSemester} onChange={(e) => setSem(e.target.value)} className="w-64" />
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Card><p className="text-sm text-gray-400 py-8 text-center">กำลังโหลด...</p></Card>
      ) : filtered.length === 0 ? (
        <Card><p className="text-sm text-gray-400 py-8 text-center">ไม่พบตารางเรียน</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <button key={s.id} onClick={() => handleSelect(s)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/30 hover:shadow-card-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 text-center shrink-0">
                  <div className="text-xs font-semibold text-primary">{getDayLabel(s.dayOfWeek)}</div>
                  <div className="text-xs text-gray-500">{s.startTime}–{s.endTime}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {s.section.course.code} — {s.section.course.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.section.name} | {s.room.building.code} {s.room.code}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">{s.section.semester.name}</Badge>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
