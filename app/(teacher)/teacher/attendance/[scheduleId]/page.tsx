"use client";

import { useState, use, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ClipboardList, ChevronLeft, ChevronRight, Eye, Search, SlidersHorizontal, X, Megaphone } from "lucide-react";
import { PageHeader, Button, Alert, Avatar, Modal, Select } from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import { cn, formatDate, formatDateTime, getDayLabel } from "@/lib/utils";
import type { Schedule, Enrollment, AttendanceRecord, AttendanceStatus } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function shiftDate(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const MARKS = [
  {
    status: "ON_TIME" as AttendanceStatus,
    label: "ม", title: "มาตรงเวลา",
    active: "bg-emerald-500 border-emerald-500 text-white",
    idle:   "border-gray-200 text-gray-300 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50",
  },
  {
    status: "LATE" as AttendanceStatus,
    label: "ส", title: "มาสาย",
    active: "bg-amber-400 border-amber-400 text-white",
    idle:   "border-gray-200 text-gray-300 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50",
  },
  {
    status: "ABSENT" as AttendanceStatus,
    label: "ข", title: "ขาด",
    active: "bg-red-500 border-red-500 text-white",
    idle:   "border-gray-200 text-gray-300 hover:border-red-400 hover:text-red-500 hover:bg-red-50",
  },
  {
    status: "LEAVE" as AttendanceStatus,
    label: "ล", title: "ลา",
    active: "bg-sky-500 border-sky-500 text-white",
    idle:   "border-gray-200 text-gray-300 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50",
  },
] as const;

const SUMMARY = [
  { status: "ON_TIME",     label: "ตรงเวลา", dot: "bg-emerald-500", text: "text-emerald-600" },
  { status: "LATE",        label: "สาย",     dot: "bg-amber-400",   text: "text-amber-500" },
  { status: "ABSENT",      label: "ขาด",     dot: "bg-red-500",     text: "text-red-500" },
  { status: "LEAVE",       label: "ลา",      dot: "bg-sky-500",     text: "text-sky-500" },
  { status: "NOT_CHECKED", label: "ยังไม่เช็ค", dot: "bg-gray-300", text: "text-gray-400" },
] as const;

const PRESETS = [
  { label: "ยกคลาสวันนี้",    title: "ยกคลาส",            body: "คาบวันนี้ยกเลิก พบกันคาบหน้า" },
  { label: "มีทดสอบ",         title: "แจ้งกำหนดทดสอบ",    body: "มีการทดสอบ กรุณาเตรียมความพร้อม" },
  { label: "เตรียมอุปกรณ์",   title: "เตรียมอุปกรณ์",     body: "คาบหน้ากรุณาเตรียมอุปกรณ์ / วัสดุมาด้วย" },
  { label: "เลื่อนเวลาเรียน", title: "เลื่อนเวลาเรียน",   body: "คาบเรียนมีการเปลี่ยนแปลงเวลา กรุณาติดตามรายละเอียด" },
  { label: "ส่งงาน/รายงาน",  title: "แจ้งกำหนดส่งงาน",   body: "อย่าลืมส่งงาน/รายงานตามกำหนด" },
];

export default function AttendanceCardPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const { scheduleId } = use(params);
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const classDate      = searchParams.get("classDate") ?? new Date().toISOString().slice(0, 10);

  const { data: schedule } = useFetch<Schedule>(`/schedules/${scheduleId}`);
  const sectionId = schedule?.section.id ?? null;

  const { data: enrollments, loading: el } = useFetch<Enrollment[]>(
    sectionId ? `/enrollments?sectionId=${sectionId}` : null,
  );
  const { data: records, loading: rl } = useFetch<AttendanceRecord[]>(
    `/attendance/schedule/${scheduleId}?classDate=${classDate}`,
  );

  // studentId → { id, status } from actual records
  const recordMap = useMemo(() => {
    const m = new Map<string, { id: string; status: AttendanceStatus }>();
    for (const r of records ?? []) m.set(r.student.id, { id: r.id, status: r.status });
    return m;
  }, [records]);

  // optimistic overrides (reset when date changes)
  const [overrides, setOverrides] = useState<Map<string, AttendanceStatus>>(new Map());
  useEffect(() => { setOverrides(new Map()); }, [classDate]);

  const [detailRecord, setDetail]   = useState<AttendanceRecord | null>(null);
  const [search, setSearch]         = useState("");
  const [searchQ, setSearchQ]       = useState("");
  const [filterStatus, setFilter]   = useState<AttendanceStatus | "">("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Announce state ────────────────────────────────────────────────────────
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [annTitle,     setAnnTitle]     = useState("");
  const [annBody,      setAnnBody]      = useState("");
  const [sending,      setSending]      = useState(false);

  function openAnnounce() {
    setAnnTitle(""); setAnnBody("");
    setAnnounceOpen(true);
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    setAnnTitle(p.title);
    setAnnBody(p.body);
  }

  async function sendAnnounce() {
    if (!sectionId || !annTitle.trim() || !annBody.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post<{ sent: number }>("/notifications/announce", {
        sectionId, title: annTitle.trim(), body: annBody.trim(),
      });
      toast.success(`ส่งประกาศถึงนักศึกษา ${data.sent} คนสำเร็จ`);
      setAnnounceOpen(false);
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setSending(false); }
  }
  // ─────────────────────────────────────────────────────────────────────────

  function handleSearchChange(v: string) {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQ(v), 300);
  }
  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch(""); setSearchQ(""); setFilter("");
  }
  const hasFilter = !!(searchQ || filterStatus);

  function getStatus(studentId: string): AttendanceStatus | null {
    return overrides.get(studentId) ?? recordMap.get(studentId)?.status ?? null;
  }

  async function handleMark(studentId: string, next: AttendanceStatus) {
    const prev = getStatus(studentId);
    if (prev === next) return;
    setOverrides((m) => new Map(m).set(studentId, next));
    try {
      await api.post("/attendance/mark", { studentId, scheduleId, classDate, status: next });
    } catch {
      setOverrides((m) => {
        const copy = new Map(m);
        if (prev) copy.set(studentId, prev); else copy.delete(studentId);
        return copy;
      });
      toast.error("บันทึกไม่สำเร็จ");
    }
  }

  const loading  = el || rl;
  const students = (enrollments ?? []).map((e) => e.student);

  const displayed = useMemo(() => {
    return students.filter((s) => {
      if (filterStatus) {
        const st = getStatus(s.id) ?? "NOT_CHECKED";
        if (st !== filterStatus) return false;
      }
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (
          !s.firstName.toLowerCase().includes(q) &&
          !s.lastName.toLowerCase().includes(q) &&
          !s.code.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, filterStatus, searchQ, overrides, recordMap]);

  // summary counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { ON_TIME: 0, LATE: 0, ABSENT: 0, LEAVE: 0, NOT_CHECKED: 0 };
    for (const s of students) {
      const st = getStatus(s.id) ?? "NOT_CHECKED";
      c[st] = (c[st] ?? 0) + 1;
    }
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, overrides, recordMap]);

  return (
    <div>
      <PageHeader
        title={schedule ? `${schedule.section.course.code} — ${schedule.section.course.name}` : "กำลังโหลด..."}
        subtitle={schedule
          ? `${schedule.section.name} · วัน${getDayLabel(schedule.dayOfWeek)} ${schedule.startTime}–${schedule.endTime}`
          : undefined}
        icon={<ClipboardList size={20} />}
        breadcrumb={[{ label: "เช็คชื่อ", href: "/teacher/attendance" }, { label: "รายชื่อนักศึกษา" }]}
        actions={
          <Button
            size="md"
            variant="outline"
            leftIcon={<Megaphone size={16} />}
            onClick={openAnnounce}
            disabled={!sectionId}
          >
            แจ้ง นศ.
          </Button>
        }
      />

      {/* Date nav + summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="md" className="w-10 px-0"
            onClick={() => router.push(`/teacher/attendance/${scheduleId}?classDate=${shiftDate(classDate, -1)}`)}>
            <ChevronLeft size={16} />
          </Button>
          <input
            type="date" value={classDate}
            onChange={(e) => router.push(`/teacher/attendance/${scheduleId}?classDate=${e.target.value}`)}
            className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <Button variant="outline" size="md" className="w-10 px-0"
            onClick={() => router.push(`/teacher/attendance/${scheduleId}?classDate=${shiftDate(classDate, 1)}`)}>
            <ChevronRight size={16} />
          </Button>
          <span className="text-sm text-gray-500 ml-1">{formatDate(classDate)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {SUMMARY.map(({ status, label, dot, text }) => (
            <span key={status} className={cn("flex items-center gap-1 text-xs font-medium", text)}>
              <span className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
              {label} {loading ? "—" : (counts[status] ?? 0)}
            </span>
          ))}
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อ / รหัส"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Select
          options={[
            { value: "",            label: "ทุกสถานะ" },
            { value: "ON_TIME",     label: "มาตรงเวลา" },
            { value: "LATE",        label: "มาสาย" },
            { value: "ABSENT",      label: "ขาดเรียน" },
            { value: "LEAVE",       label: "ลา" },
            { value: "NOT_CHECKED", label: "ยังไม่เช็ค" },
          ]}
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value as AttendanceStatus | "")}
          className="w-36"
        />
        {hasFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
          >
            <X size={12} /> ล้าง
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {displayed.length} / {students.length} คน
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Alert variant="info">ไม่มีนักศึกษาลงทะเบียนในรายวิชานี้</Alert>
      ) : displayed.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-12">ไม่พบนักศึกษาตามเงื่อนไขที่เลือก</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {displayed.map((student) => {
            const status  = getStatus(student.id);
            const record  = records?.find((r) => r.student.id === student.id);
            const hasSelfie = !!record?.selfieUrl;

            return (
              <div
                key={student.id}
                className={cn(
                  "relative bg-white rounded-xl border-2 p-3.5 flex flex-col items-center gap-2 transition-all",
                  status === "ON_TIME"     && "border-emerald-200 bg-emerald-50/40",
                  status === "LATE"        && "border-amber-200  bg-amber-50/40",
                  status === "ABSENT"      && "border-red-200    bg-red-50/40",
                  status === "LEAVE"       && "border-sky-200    bg-sky-50/40",
                  (!status || status === "NOT_CHECKED") && "border-gray-200",
                )}
              >
                {hasSelfie && (
                  <button
                    onClick={() => setDetail(record!)}
                    className="absolute top-2 right-2 p-0.5 text-gray-300 hover:text-primary transition-colors"
                    title="ดูรูป Selfie"
                  >
                    <Eye size={13} />
                  </button>
                )}

                <Avatar
                  src={student.profileImageUrl ? `${API_URL}${student.profileImageUrl}` : null}
                  name={`${student.firstName} ${student.lastName}`}
                  size="xl"
                />

                <div className="text-center w-full px-1">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{student.code}</p>
                </div>

                <div className="flex gap-1.5 mt-0.5">
                  {MARKS.map((m) => (
                    <button
                      key={m.status}
                      title={m.title}
                      onClick={() => handleMark(student.id, m.status)}
                      className={cn(
                        "w-8 h-8 rounded-full text-xs font-bold border-2 transition-all",
                        status === m.status ? m.active : m.idle,
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selfie / detail modal */}
      <Modal
        open={!!detailRecord}
        onClose={() => setDetail(null)}
        title="ข้อมูลการเช็คชื่อ"
        size="md"
        footer={<Button variant="secondary" onClick={() => setDetail(null)}>ปิด</Button>}
      >
        {detailRecord && (
          <div className="space-y-4">
            {detailRecord.selfieUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detailRecord.selfieUrl}
                alt="selfie"
                className="w-full max-h-72 object-contain rounded-xl bg-gray-100"
              />
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">นักศึกษา</p>
                <p className="font-medium">{detailRecord.student.firstName} {detailRecord.student.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">เวลาเช็คชื่อ</p>
                <p className="font-medium">{detailRecord.checkInTime ? formatDateTime(detailRecord.checkInTime) : "—"}</p>
              </div>
              {detailRecord.latitude && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">พิกัด GPS</p>
                  <a
                    href={`https://maps.google.com/?q=${detailRecord.latitude},${detailRecord.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-primary underline text-sm"
                  >
                    {detailRecord.latitude.toFixed(5)}, {detailRecord.longitude?.toFixed(5)}
                  </a>
                </div>
              )}
              {detailRecord.isAnomalous && (
                <div className="col-span-2">
                  <Alert variant="warning" title="พบความผิดปกติ">บันทึกนี้ถูก flag ว่าผิดปกติ</Alert>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Announce modal */}
      <Modal
        open={announceOpen}
        onClose={() => setAnnounceOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Megaphone size={15} className="text-primary" />
            </span>
            <span>
              ประกาศ
              {schedule && (
                <span className="font-normal text-gray-500 ml-1.5">
                  {schedule.section.course.name}
                  <span className="text-gray-400"> ({schedule.section.name})</span>
                </span>
              )}
            </span>
          </div>
        }
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAnnounceOpen(false)}>ยกเลิก</Button>
            <Button
              leftIcon={<Megaphone size={14} />}
              onClick={sendAnnounce}
              loading={sending}
              disabled={!annTitle.trim() || !annBody.trim()}
            >
              ส่งประกาศ
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">ข้อความสำเร็จรูป</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หัวข้อ <span className="text-danger">*</span>
            </label>
            <input
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="เช่น วันนี้ยกคลาส"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด <span className="text-danger">*</span>
            </label>
            <textarea
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              placeholder="เช่น คาบวันนี้ยกเลิก พบกันคาบหน้า"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
