"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings } from "lucide-react";
import { PageHeader, Button, Card, Select, Input, Alert } from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { Schedule, Semester } from "@/types";

const settingsSchema = z.object({
  lateThresholdMinutes: z.coerce.number().min(1).max(60),
  gpsRadiusMeters:      z.coerce.number().min(10).max(1000),
  openBeforeMinutes:    z.coerce.number().min(0).max(60),
  closeAfterMinutes:    z.coerce.number().min(0).max(120),
  requireSelfie:        z.boolean(),
});
type SettingsForm = z.infer<typeof settingsSchema>;

interface AttendanceSettings extends SettingsForm { id?: string; }

export default function TeacherSettingsPage() {
  const { data: schedules } = useFetch<Schedule[]>("/schedules");
  const { data: semesters } = useFetch<Semester[]>("/semesters");

  const [filterSem, setFilter]   = useState("");
  const [scheduleId, setSchedId] = useState("");

  const settingsUrl = scheduleId ? `/attendance-settings/${scheduleId}` : null;
  const { data: settings, loading, error, refetch } = useFetch<AttendanceSettings>(settingsUrl);

  const semOptions   = (semesters ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.academicYear.name})` }));
  const schedOptions = (schedules ?? [])
    .filter((s) => !filterSem || s.section.semester.id === filterSem)
    .map((s) => ({ value: s.id, label: `${s.section.course.code} ${s.section.course.name} — ${s.section.name}` }));

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settingsSchema) as any,
  });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  async function onSubmit(v: SettingsForm) {
    if (!scheduleId) { toast.error("กรุณาเลือกวิชาก่อน"); return; }
    try {
      await api.put(`/attendance-settings/${scheduleId}`, v);
      toast.success("บันทึกการตั้งค่าสำเร็จ");
      refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  return (
    <div>
      <PageHeader title="ตั้งค่าเงื่อนไขเช็คชื่อ" subtitle="ปรับเงื่อนไขสำหรับแต่ละวิชา (override ค่า default ของระบบ)" icon={<Settings size={20} />} />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-3">
          <Select options={[{ value: "", label: "ทุกภาคการศึกษา" }, ...semOptions]}
            value={filterSem} onChange={(e) => { setFilter(e.target.value); setSchedId(""); }} className="w-52" />
          <Select options={[{ value: "", label: "เลือกรายวิชา" }, ...schedOptions]}
            value={scheduleId} onChange={(e) => setSchedId(e.target.value)} className="w-72" />
        </div>
      </Card>

      {!scheduleId && <Card><p className="text-sm text-gray-400 text-center py-8">เลือกรายวิชาเพื่อดูและแก้ไขการตั้งค่า</p></Card>}
      {scheduleId && error && <Alert variant="danger">{error}</Alert>}

      {scheduleId && !error && (
        <Card className="max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">เงื่อนไขเวลา</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input label="เปิดก่อนเวลาเรียน (นาที)" type="number" min={0} max={60}
                  error={errors.openBeforeMinutes?.message} {...register("openBeforeMinutes")} />
                <Input label="ปิดหลังเริ่มเรียน (นาที)" type="number" min={0} max={120}
                  error={errors.closeAfterMinutes?.message} {...register("closeAfterMinutes")} />
              </div>
              <Input label="นาทีสายสูงสุด" type="number" min={1} max={60}
                error={errors.lateThresholdMinutes?.message} {...register("lateThresholdMinutes")} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">GPS</h3>
              <Input label="รัศมีตรวจสอบตำแหน่ง (เมตร)" type="number" min={10} max={1000}
                error={errors.gpsRadiusMeters?.message} {...register("gpsRadiusMeters")} />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" {...register("requireSelfie")} className="w-4 h-4 rounded accent-primary" />
              บังคับถ่ายรูป Selfie
            </label>
            <Button type="submit" loading={isSubmitting || loading}>บันทึกการตั้งค่า</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
