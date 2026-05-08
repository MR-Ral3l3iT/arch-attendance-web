"use client";

import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { PageHeader, Card, Select, Table, Badge } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import type { Schedule, Semester } from "@/types";

type AnnouncementType = "GENERAL" | "CANCEL_CLASS" | "EXAM" | "RESCHEDULE";

interface AnnouncementHistory {
  id: string;
  type: AnnouncementType;
  title: string;
  body: string;
  sectionId: string;
  scheduleId?: string;
  classDate?: string;
  sentAt: string;
  sentCount: number;
  readCount: number;
}

interface CancellationHistory {
  id: string;
  classDate: string;
  reason?: string;
  schedule: Schedule;
}

interface TeacherHistoryResponse {
  announcements: AnnouncementHistory[];
  cancellations: CancellationHistory[];
}

const TYPE_LABEL: Record<AnnouncementType, string> = {
  GENERAL: "ทั่วไป",
  CANCEL_CLASS: "ยกคลาส",
  EXAM: "สอบ/ทดสอบ",
  RESCHEDULE: "เลื่อนเวลาเรียน",
};

export default function TeacherAnnouncementsPage() {
  const [filterSemester, setSemester] = useState("");
  const [filterSchedule, setSchedule] = useState("");
  const [filterType, setType] = useState<AnnouncementType | "">("");

  const { data: me } = useFetch<{ teacherId?: string }>("/profile/me");
  const schedulesUrl = me?.teacherId ? `/schedules?teacherId=${me.teacherId}` : null;
  const { data: schedules } = useFetch<Schedule[]>(schedulesUrl);
  const { data: semesters } = useFetch<Semester[]>("/semesters");

  const semOptions = (semesters ?? []).map((s) => ({
    value: s.id,
    label: `${s.name} (${s.academicYear.name})`,
  }));

  const schedOptions = (schedules ?? [])
    .filter((s) => !filterSemester || s.section.semester.id === filterSemester)
    .map((s) => ({
      value: s.id,
      label: `${s.section.course.code} ${s.section.course.name} — ${s.section.name}`,
    }));

  const params = new URLSearchParams();
  if (filterSchedule) params.set("scheduleId", filterSchedule);
  if (filterType) params.set("type", filterType);
  const historyUrl = `/notifications/teacher/history?${params.toString()}`;
  const { data: history } = useFetch<TeacherHistoryResponse>(historyUrl);

  const announcements = history?.announcements ?? [];
  const cancellations = history?.cancellations ?? [];

  const sectionNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of schedules ?? []) {
      m.set(
        s.section.id,
        `${s.section.course.code} ${s.section.course.name} — ${s.section.name}`,
      );
    }
    return m;
  }, [schedules]);

  return (
    <div>
      <PageHeader
        title="ประวัติประกาศ"
        subtitle="ดูสถานะประกาศแยกตามประเภท และประวัติการยกคลาส"
        icon={<Megaphone size={20} />}
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-3">
          <Select
            options={[{ value: "", label: "ทุกภาคการศึกษา" }, ...semOptions]}
            value={filterSemester}
            onChange={(e) => {
              setSemester(e.target.value);
              setSchedule("");
            }}
            className="w-56"
          />
          <Select
            options={[{ value: "", label: "ทุกรายวิชา" }, ...schedOptions]}
            value={filterSchedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-80"
          />
          <Select
            options={[
              { value: "", label: "ทุกประเภทประกาศ" },
              { value: "GENERAL", label: "ทั่วไป" },
              { value: "CANCEL_CLASS", label: "ยกคลาส" },
              { value: "EXAM", label: "สอบ/ทดสอบ" },
              { value: "RESCHEDULE", label: "เลื่อนเวลาเรียน" },
            ]}
            value={filterType}
            onChange={(e) => setType(e.target.value as AnnouncementType | "")}
            className="w-48"
          />
        </div>
      </Card>

      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">สถานะประกาศ</h3>
        <Table
          data={announcements}
          keyField="id"
          emptyMessage="ยังไม่มีประวัติประกาศ"
          columns={[
            {
              key: "type",
              header: "ประเภท",
              render: (r) => <Badge variant={r.type === "CANCEL_CLASS" ? "warning" : "secondary"}>{TYPE_LABEL[r.type]}</Badge>,
            },
            {
              key: "title",
              header: "หัวข้อ",
              render: (r) => (
                <div>
                  <p className="font-medium text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[420px]">{r.body}</p>
                </div>
              ),
            },
            {
              key: "section",
              header: "รายวิชา",
              render: (r) => sectionNameById.get(r.sectionId) ?? r.sectionId,
            },
            {
              key: "sent",
              header: "ส่ง/อ่าน",
              render: (r) => `${r.readCount}/${r.sentCount}`,
            },
            {
              key: "scope",
              header: "กลุ่มเป้าหมาย",
              render: () => <Badge variant="info">นักศึกษาในรายวิชานี้</Badge>,
            },
            {
              key: "sentAt",
              header: "เวลาส่ง",
              render: (r) => new Date(r.sentAt).toLocaleString("th-TH"),
            },
          ]}
        />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">ประวัติยกคลาส</h3>
        <Table
          data={cancellations}
          keyField="id"
          emptyMessage="ยังไม่มีประวัติยกคลาส"
          columns={[
            {
              key: "date",
              header: "วันที่",
              render: (r) => new Date(r.classDate).toISOString().slice(0, 10),
            },
            {
              key: "course",
              header: "รายวิชา",
              render: (r) =>
                `${r.schedule.section.course.code} ${r.schedule.section.course.name} — ${r.schedule.section.name}`,
            },
            {
              key: "reason",
              header: "เหตุผล",
              render: (r) => r.reason ?? "—",
            },
          ]}
        />
      </Card>
    </div>
  );
}
