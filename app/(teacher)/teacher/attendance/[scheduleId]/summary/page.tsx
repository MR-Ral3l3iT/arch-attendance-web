"use client";

import { useState, use, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight, CalendarDays, ClipboardList, Search, X } from "lucide-react";
import { PageHeader, Card, Table, Button, Modal, Badge, Avatar, Alert, Select, Pagination } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { cn, formatDate } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

const API_URL   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 20;

/* ── Types ── */
interface StudentSummary {
  student: {
    id: string; code: string; firstName: string; lastName: string;
    profileImageUrl?: string | null; department?: { name: string };
  };
  onTime: number; late: number; absent: number; leave: number;
  notChecked: number; attendanceRate: number;
}
interface StudentRow extends StudentSummary { id: string; }

interface SummaryData {
  schedule: { id: string; courseCode: string; courseName: string; sectionName: string; totalClasses: number };
  students: StudentSummary[];
}

interface AttendanceLog {
  id: string; status: AttendanceStatus; classDate: string;
  checkInTime?: string; note?: string;
}

const STATUS_META: Record<AttendanceStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "secondary" }> = {
  ON_TIME:     { label: "มาตรงเวลา",  variant: "success" },
  LATE:        { label: "มาสาย",      variant: "warning" },
  ABSENT:      { label: "ขาดเรียน",   variant: "danger"  },
  LEAVE:       { label: "ลา",         variant: "info"    },
  NOT_CHECKED: { label: "ไม่มีข้อมูล", variant: "secondary" },
};

const RATE_FILTER_OPTIONS = [
  { value: "",    label: "ทุกระดับ" },
  { value: "ok",  label: "≥ 80% (ปกติ)" },
  { value: "mid", label: "60–79% (เฝ้าระวัง)" },
  { value: "low", label: "< 60% (เสี่ยงตก)" },
];

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? "bg-emerald-500" : rate >= 60 ? "bg-amber-400" : "bg-red-500";
  const text  = rate >= 80 ? "text-emerald-600" : rate >= 60 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex items-center gap-2 min-w-[96px]">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${rate}%` }} />
      </div>
      <span className={cn("text-xs font-semibold tabular-nums w-8 text-right shrink-0", text)}>{rate}%</span>
    </div>
  );
}

export default function ScheduleSummaryPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const { scheduleId } = use(params);
  const router = useRouter();

  const { data, loading, error } = useFetch<SummaryData>(`/reports/schedule/${scheduleId}/students`);

  /* ── search / filter / pagination ── */
  const [search, setSearch]       = useState("");
  const [searchQ, setSearchQ]     = useState("");
  const [rateFilter, setRate]     = useState("");
  const [page, setPage]           = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(v: string) {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearchQ(v); setPage(1); }, 300);
  }
  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch(""); setSearchQ(""); setRate(""); setPage(1);
  }
  const hasFilter = !!(searchQ || rateFilter);

  /* flatten for Table keyField */
  const allRows: StudentRow[] = useMemo(
    () => (data?.students ?? []).map((s) => ({ ...s, id: s.student.id })),
    [data],
  );

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (
          !r.student.firstName.toLowerCase().includes(q) &&
          !r.student.lastName.toLowerCase().includes(q) &&
          !r.student.code.toLowerCase().includes(q)
        ) return false;
      }
      if (rateFilter === "ok"  && r.attendanceRate < 80)  return false;
      if (rateFilter === "mid" && (r.attendanceRate < 60 || r.attendanceRate >= 80)) return false;
      if (rateFilter === "low" && r.attendanceRate >= 60) return false;
      return true;
    });
  }, [allRows, searchQ, rateFilter]);

  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
  const paged        = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const schedule     = data?.schedule;

  /* ── student log modal ── */
  const [selected, setSelected] = useState<StudentRow | null>(null);
  const { data: logs, loading: ll } = useFetch<AttendanceLog[]>(
    selected ? `/attendance/student/${selected.student.id}?scheduleId=${scheduleId}` : null,
  );

  return (
    <div>
      <PageHeader
        title={schedule ? `${schedule.courseCode} — ${schedule.courseName}` : "กำลังโหลด..."}
        subtitle={schedule ? `${schedule.sectionName} · ${schedule.totalClasses} คาบ` : undefined}
        icon={<Users size={20} />}
        breadcrumb={[{ label: "เช็คชื่อ", href: "/teacher/attendance" }, { label: "สรุปรายนักศึกษา" }]}
        actions={
          <Button size="sm" variant="outline" leftIcon={<ClipboardList size={14} />}
            onClick={() => router.push(`/teacher/attendance/${scheduleId}?classDate=${new Date().toISOString().slice(0,10)}`)}>
            เช็คชื่อวันนี้
          </Button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ค้นหาชื่อ / รหัส"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Select
            options={RATE_FILTER_OPTIONS}
            value={rateFilter}
            onChange={(e) => { setRate(e.target.value); setPage(1); }}
            className="w-44"
          />
          {hasFilter && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap">
              <X size={12} /> ล้าง
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
            {filtered.length} / {allRows.length} คน
          </span>
        </div>

        <Table
          data={paged}
          keyField="id"
          loading={loading}
          emptyMessage="ไม่มีนักศึกษาตามเงื่อนไขที่เลือก"
          columns={[
            {
              key: "student", header: "นักศึกษา",
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={r.student.profileImageUrl ? `${API_URL}${r.student.profileImageUrl}` : null}
                    name={`${r.student.firstName} ${r.student.lastName}`}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.student.firstName} {r.student.lastName}</p>
                    <p className="text-xs text-gray-400">{r.student.code}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "onTime", header: "มาตรงเวลา", className: "w-28 text-center",
              render: (r) => <span className="text-sm font-semibold text-emerald-600">{r.onTime}</span>,
            },
            {
              key: "late", header: "มาสาย", className: "w-20 text-center",
              render: (r) => <span className="text-sm font-semibold text-amber-500">{r.late}</span>,
            },
            {
              key: "leave", header: "ลา", className: "w-16 text-center",
              render: (r) => <span className="text-sm font-semibold text-sky-500">{r.leave}</span>,
            },
            {
              key: "absent", header: "ขาด", className: "w-16 text-center",
              render: (r) => <span className="text-sm font-semibold text-red-500">{r.absent}</span>,
            },
            {
              key: "notChecked", header: "ไม่มีข้อมูล", className: "w-24 text-center",
              render: (r) => <span className="text-sm text-gray-400">{r.notChecked}</span>,
            },
            {
              key: "rate", header: "เปอร์เซ็นต์เข้าเรียน", className: "w-44",
              render: (r) => <RateBar rate={r.attendanceRate} />,
            },
            {
              key: "actions", header: "", className: "w-10",
              render: (r) => (
                <button onClick={() => setSelected(r)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                  title="ดู log รายวัน">
                  <ChevronRight size={16} />
                </button>
              ),
            },
          ]}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          limit={PAGE_SIZE}
          onPageChange={setPage}
          className="mt-4"
        />
      </Card>

      {/* Footer stats */}
      {!loading && allRows.length > 0 && schedule && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 px-1">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} className="text-gray-400" /> {schedule.totalClasses} คาบ
          </span>
          <span>นักศึกษา {allRows.length} คน</span>
          <span className="text-emerald-600 font-medium">
            เฉลี่ย {allRows.length > 0 ? Math.round(allRows.reduce((s, r) => s + r.attendanceRate, 0) / allRows.length) : 0}%
          </span>
          <span className="text-red-500">
            เสี่ยงตก {allRows.filter(r => r.attendanceRate < 60).length} คน
          </span>
        </div>
      )}

      {/* Log modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected ? `${selected.student.firstName} ${selected.student.lastName} (${selected.student.code})` : ""}
        footer={<Button variant="secondary" onClick={() => setSelected(null)}>ปิด</Button>}
      >
        {selected && (
          <div className="space-y-3">
            {/* mini summary */}
            <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-xl text-center text-sm">
              <div><p className="text-xl font-bold text-emerald-600">{selected.onTime}</p><p className="text-xs text-gray-400 mt-0.5">ตรงเวลา</p></div>
              <div><p className="text-xl font-bold text-amber-500">{selected.late}</p><p className="text-xs text-gray-400 mt-0.5">สาย</p></div>
              <div><p className="text-xl font-bold text-sky-500">{selected.leave}</p><p className="text-xs text-gray-400 mt-0.5">ลา</p></div>
              <div><p className="text-xl font-bold text-red-500">{selected.absent}</p><p className="text-xs text-gray-400 mt-0.5">ขาด</p></div>
              <div><p className="text-xl font-bold">{selected.attendanceRate}%</p><p className="text-xs text-gray-400 mt-0.5">เข้าเรียน</p></div>
            </div>

            {ll ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : !logs || logs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีบันทึกการเข้าเรียน</p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
                {[...logs].sort((a, b) => a.classDate.localeCompare(b.classDate)).map((log) => {
                  const meta = STATUS_META[log.status] ?? STATUS_META.NOT_CHECKED;
                  return (
                    <div key={log.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700 font-medium w-36 shrink-0">
                        {formatDate(log.classDate)}
                      </span>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      {log.checkInTime && (
                        <span className="text-xs text-gray-400">
                          {new Date(log.checkInTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                        </span>
                      )}
                      {log.note && (
                        <span className="text-xs text-gray-400 truncate ml-auto max-w-[160px]">{log.note}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
