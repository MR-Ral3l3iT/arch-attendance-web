"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PageHeader, Button, Card, Table, Modal, ConfirmModal, Input, Select, Alert, Pagination,
} from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import { getDayLabel, formatTeacherName } from "@/lib/utils";
import type { Schedule, Section, Room, Semester } from "@/types";

const DAY_OPTIONS = [
  { value: "MONDAY",    label: "จันทร์" },
  { value: "TUESDAY",   label: "อังคาร" },
  { value: "WEDNESDAY", label: "พุธ" },
  { value: "THURSDAY",  label: "พฤหัสบดี" },
  { value: "FRIDAY",    label: "ศุกร์" },
  { value: "SATURDAY",  label: "เสาร์" },
  { value: "SUNDAY",    label: "อาทิตย์" },
];

const scheduleSchema = z.object({
  sectionId:  z.string().min(1, "กรุณาเลือกกลุ่มเรียน"),
  dayOfWeek:  z.enum(["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]),
  startTime:  z.string().min(1, "กรุณากรอกเวลาเริ่ม"),
  endTime:    z.string().min(1, "กรุณากรอกเวลาสิ้นสุด"),
  roomId:     z.string().min(1, "กรุณาเลือกห้อง"),
});
type ScheduleForm = z.infer<typeof scheduleSchema>;

const LIMIT = 20;

export default function SchedulesPage() {
  const { data, loading, error, refetch } = useFetch<Schedule[]>("/schedules");
  const { data: sections }  = useFetch<Section[]>("/sections");
  const { data: rooms }     = useFetch<Room[]>("/rooms");
  const { data: semesters } = useFetch<Semester[]>("/semesters");

  const [filterSemester, setFilter] = useState("");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState<{ open: boolean; item?: Schedule }>({ open: false });
  const [deleteTarget, setDelete]   = useState<Schedule | null>(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => { setPage(1); }, [filterSemester, search]);

  const sectionOptions = (sections ?? []).map((s) => ({
    value: s.id,
    label: `${s.course.code} — ${s.course.name} (${s.name})`,
  }));
  const roomOptions = (rooms ?? []).map((r) => ({ value: r.id, label: `${r.building.code} ${r.code} — ${r.name}` }));
  const semesterOptions = (semesters ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.academicYear.name})` }));

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  });

  useEffect(() => {
    if (modal.open) reset(modal.item
      ? { sectionId: modal.item.section.id, dayOfWeek: modal.item.dayOfWeek,
          startTime: modal.item.startTime, endTime: modal.item.endTime, roomId: modal.item.room.id }
      : { sectionId: "", dayOfWeek: "MONDAY", startTime: "08:00", endTime: "11:00", roomId: "" });
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: ScheduleForm) {
    try {
      if (modal.item) {
        await api.put(`/schedules/${modal.item.id}`, v);
      } else {
        await api.post("/schedules", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มตารางเรียนสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/schedules/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const filtered = (data ?? []).filter((s) => {
    if (filterSemester && s.section.semester.id !== filterSemester) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.section.course.code.toLowerCase().includes(q) ||
        s.section.course.name.toLowerCase().includes(q) ||
        formatTeacherName(s.teacher).toLowerCase().includes(q) ||
        s.section.name.toLowerCase().includes(q)
      );
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <div><PageHeader title="ตารางเรียน" icon={<CalendarDays size={20} />} /><Alert variant="danger">{error}</Alert></div>;

  return (
    <div>
      <PageHeader title="จัดการตารางเรียน" icon={<CalendarDays size={20} />}
        actions={<Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มตารางเรียน</Button>}
      />
      <Card>
        <div className="flex flex-wrap gap-2 mb-4">
          <Select options={[{ value: "", label: "ทุกภาคการศึกษา" }, ...semesterOptions]}
            value={filterSemester} onChange={(e) => setFilter(e.target.value)} className="w-56" />
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาวิชา, อาจารย์..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีตารางเรียน"
          columns={[
            { key: "course", header: "วิชา", render: (r) => `${r.section.course.code} ${r.section.course.name}` },
            { key: "section", header: "กลุ่ม", render: (r) => r.section.name },
            { key: "day", header: "วัน", render: (r) => getDayLabel(r.dayOfWeek) },
            { key: "time", header: "เวลา", render: (r) => `${r.startTime} – ${r.endTime}` },
            { key: "room", header: "ห้อง", render: (r) => `${r.room.building.code} ${r.room.code}` },
            { key: "teacher", header: "อาจารย์", render: (r) => formatTeacherName(r.teacher) },
            { key: "actions", header: "", render: (r) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => setModal({ open: true, item: r })}><Pencil size={14} /></Button>
                <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => setDelete(r)}><Trash2 size={14} /></Button>
              </div>
            )},
          ]}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          limit={LIMIT}
          onPageChange={setPage}
          className="mt-4"
        />
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} size="lg"
        title={modal.item ? "แก้ไขตารางเรียน" : "เพิ่มตารางเรียน"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="sched-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="sched-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="กลุ่มเรียน" required options={sectionOptions} placeholder="เลือกกลุ่มเรียน"
            error={errors.sectionId?.message} {...register("sectionId")} />
          <div className="grid grid-cols-3 gap-3">
            <Select label="วัน" required options={DAY_OPTIONS} error={errors.dayOfWeek?.message} {...register("dayOfWeek")} />
            <Input label="เวลาเริ่ม" type="time" required error={errors.startTime?.message} {...register("startTime")} />
            <Input label="เวลาสิ้นสุด" type="time" required error={errors.endTime?.message} {...register("endTime")} />
          </div>
          <Select label="ห้องเรียน" required options={roomOptions} placeholder="เลือกห้อง"
            error={errors.roomId?.message} {...register("roomId")} />
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบตารางเรียน"
        description={`ต้องการลบตาราง ${deleteTarget ? `${deleteTarget.section.course.code} วัน${getDayLabel(deleteTarget.dayOfWeek)}` : ""} ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </div>
  );
}
