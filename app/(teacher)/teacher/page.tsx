"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck, FileText, LayoutDashboard, CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";
import { PageHeader, StatCard, Badge } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { useAuthStore } from "@/store/auth.store";
import { formatDate, getDayLabel } from "@/lib/utils";
import type { Schedule, LeaveRequest, ScheduleStats } from "@/types";

const JS_DAY_TO_API: Record<number, string> = {
  0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
};

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-bold leading-none ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

function AttendanceStats({ scheduleId, classDate }: { scheduleId: string; classDate: string }) {
  const { data, loading } = useFetch<ScheduleStats>(
    `/attendance/schedule/${scheduleId}/stats?classDate=${classDate}`,
  );

  if (loading) return <div className="h-8 animate-pulse bg-gray-100 rounded-lg" />;
  if (!data || data.total === 0) return (
    <p className="text-xs text-gray-400 text-center py-1">ยังไม่มีการเช็คชื่อ</p>
  );

  const checked = data.onTime + data.late;
  return (
    <div className="flex justify-around pt-3 mt-3 border-t border-gray-100">
      <StatPill label="เข้าเรียน"   value={checked}        color="text-success" />
      <StatPill label="ยังไม่เช็ค"  value={data.notChecked} color="text-warning" />
      <StatPill label="ลา"          value={data.leave}      color="text-info" />
      <StatPill label="ขาด"         value={data.absent}     color="text-danger" />
    </div>
  );
}

export default function TeacherDashboardPage() {
  const { user }  = useAuthStore();
  const router    = useRouter();
  const today     = new Date();
  const todayStr  = today.toISOString().slice(0, 10);
  const todayDay  = JS_DAY_TO_API[today.getDay()];

  const { data: schedules, loading: sl } = useFetch<Schedule[]>("/schedules");
  const { data: pending,   loading: pl } = useFetch<LeaveRequest[]>("/leave-requests/pending");

  // group schedules by sectionId → one card per section
  const sectionMap = new Map<string, { section: Schedule["section"]; slots: Schedule[] }>();
  for (const s of schedules ?? []) {
    const entry = sectionMap.get(s.section.id) ?? { section: s.section, slots: [] };
    entry.slots.push(s);
    sectionMap.set(s.section.id, entry);
  }
  const sectionCards = Array.from(sectionMap.values()).map((entry) => ({
    ...entry,
    todaySlot: entry.slots.find((s) => s.dayOfWeek === todayDay) ?? null,
  }));

  const todayCount = sectionCards.filter((c) => c.todaySlot).length;

  return (
    <div>
      <PageHeader
        title={`สวัสดี ${user?.firstName ?? ""}`}
        subtitle={formatDate(today)}
        icon={<LayoutDashboard size={20} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="รายวิชาที่สอน" value={sl ? "..." : sectionCards.length}
          icon={<Calendar size={20} />} accent="primary" />
        <StatCard title="มีคาบวันนี้" value={sl ? "..." : todayCount}
          icon={<ClipboardCheck size={20} />} accent="success" />
        <StatCard title="คำขอลารอดำเนินการ" value={pl ? "..." : (pending?.length ?? "—")}
          icon={<FileText size={20} />} accent="warning" />
      </div>

      {sl ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : sectionCards.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-12">ไม่พบรายวิชาที่สอน</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sectionCards.map(({ section, slots, todaySlot }) => (
            <button
              key={section.id}
              onClick={() => todaySlot
                ? router.push(`/teacher/attendance/${todaySlot.id}?classDate=${todayStr}`)
                : router.push(`/teacher/attendance`)
              }
              className="group text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all"
            >
              {/* header */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary truncate">{section.course.code}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate leading-snug mt-0.5">
                    {section.course.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{section.name}</p>
                </div>
                {todaySlot ? (
                  <Badge variant="success" className="shrink-0 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 size={11} /> มีคาบวันนี้
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0 flex items-center gap-1 text-[11px]">
                    <XCircle size={11} /> ไม่มีวันนี้
                  </Badge>
                )}
              </div>

              {/* today's time slot */}
              {todaySlot ? (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                  <Clock size={12} className="text-gray-400" />
                  {todaySlot.startTime}–{todaySlot.endTime}
                  <span className="text-gray-300">·</span>
                  {todaySlot.room.building.code} {todaySlot.room.code}
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400">
                  {slots.map((s) => getDayLabel(s.dayOfWeek)).join(" · ")}
                </div>
              )}

              {/* attendance stats (only when today has class) */}
              {todaySlot && (
                <AttendanceStats scheduleId={todaySlot.id} classDate={todayStr} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
