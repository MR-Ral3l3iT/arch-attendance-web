"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader, Button, Card, Input, Alert, Select } from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { Holiday, Semester } from "@/types";

const settingsSchema = z.object({
  lateThresholdMinutes: z.coerce.number().min(1).max(60),
  gpsRadiusMeters:      z.coerce.number().min(10).max(1000),
  openBeforeMinutes:    z.coerce.number().min(0).max(60),
  closeAfterMinutes:    z.coerce.number().min(0).max(120),
  requireSelfie:        z.boolean(),
});
type SettingsForm = z.infer<typeof settingsSchema>;

interface SystemSettings {
  lateThresholdMinutes: number;
  gpsRadiusMeters:      number;
  openBeforeMinutes:    number;
  closeAfterMinutes:    number;
  requireSelfie:        boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "holidays">("general");
  const { data, loading, error, refetch } = useFetch<SystemSettings>("/system-settings");
  const { data: semesters } = useFetch<Semester[]>("/semesters");
  const [holidaySemesterId, setHolidaySemesterId] = useState("");
  const holidaysUrl = holidaySemesterId ? `/system-settings/holidays?semesterId=${holidaySemesterId}` : null;
  const { data: holidays, refetch: refetchHolidays } = useFetch<Holiday[]>(holidaysUrl);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [savingHoliday, setSavingHoliday] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settingsSchema) as any,
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  async function onSubmit(v: SettingsForm) {
    try {
      await api.put("/system-settings", v);
      toast.success("บันทึกการตั้งค่าสำเร็จ");
      refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function addHoliday() {
    if (!holidaySemesterId || !holidayDate || !holidayName.trim()) return;
    setSavingHoliday(true);
    try {
      await api.post("/system-settings/holidays", {
        semesterId: holidaySemesterId,
        date: holidayDate,
        name: holidayName.trim(),
      });
      toast.success("บันทึกวันหยุดสำเร็จ");
      setHolidayName("");
      refetchHolidays();
    } catch (e) {
      toast.error(parseApiError(e));
    } finally {
      setSavingHoliday(false);
    }
  }

  async function deleteHoliday(id: string) {
    try {
      await api.delete(`/system-settings/holidays/${id}`);
      toast.success("ลบวันหยุดสำเร็จ");
      refetchHolidays();
    } catch (e) {
      toast.error(parseApiError(e));
    }
  }

  if (error) return <div><PageHeader title="ตั้งค่าระบบ" icon={<SlidersHorizontal size={20} />} /><Alert variant="danger">{error}</Alert></div>;

  return (
    <div>
      <PageHeader title="ตั้งค่าระบบ" subtitle="ค่าเริ่มต้นสำหรับการเช็คชื่อทุกรายวิชา (อาจารย์สามารถ override ได้)" icon={<SlidersHorizontal size={20} />} />

      <Card className="max-w-3xl mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "general"
                ? "bg-white text-primary font-semibold shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            ค่าระบบ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("holidays")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "holidays"
                ? "bg-white text-primary font-semibold shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            วันหยุดภาคการศึกษา
          </button>
        </div>
      </Card>

      {activeTab === "general" && (
        <Card className="max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">เงื่อนไขเวลา</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input label="เปิดล่วงหน้า (นาที)" type="number" min={0} max={60}
                  hint="เปิดก่อนเวลาเรียน" error={errors.openBeforeMinutes?.message}
                  {...register("openBeforeMinutes")} />
                <Input label="ปิดหลังเวลาเรียน (นาที)" type="number" min={0} max={120}
                  hint="ปิดหลังจากเวลาเรียนเริ่ม" error={errors.closeAfterMinutes?.message}
                  {...register("closeAfterMinutes")} />
              </div>
              <Input label="นาทีสายสูงสุด" type="number" min={1} max={60}
                hint="หากเช็คชื่อหลังจาก X นาที ถือว่าสาย"
                error={errors.lateThresholdMinutes?.message} {...register("lateThresholdMinutes")} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">GPS</h3>
              <Input label="รัศมีตรวจสอบตำแหน่ง (เมตร)" type="number" min={10} max={1000}
                error={errors.gpsRadiusMeters?.message} {...register("gpsRadiusMeters")} />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" {...register("requireSelfie")} className="w-4 h-4 rounded accent-primary" />
              บังคับถ่ายรูป Selfie เมื่อเช็คชื่อ
            </label>

            <div className="pt-2">
              <Button type="submit" loading={isSubmitting || loading}>บันทึกการตั้งค่า</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === "holidays" && (
        <Card className="max-w-3xl">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">วันหยุดภาคการศึกษา</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                options={[
                  { value: "", label: "เลือกภาคการศึกษา" },
                  ...((semesters ?? []).map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.academicYear.name})`,
                  }))),
                ]}
                value={holidaySemesterId}
                onChange={(e) => setHolidaySemesterId(e.target.value)}
              />
              <Input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
              <Input
                placeholder="ชื่อวันหยุด"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
              />
            </div>
            <div>
              <Button
                onClick={addHoliday}
                loading={savingHoliday}
                disabled={!holidaySemesterId || !holidayDate || !holidayName.trim()}
              >
                เพิ่มวันหยุด
              </Button>
            </div>

            {!holidaySemesterId ? (
              <p className="text-sm text-gray-400">กรุณาเลือกภาคการศึกษาเพื่อดูวันหยุด</p>
            ) : (holidays ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">ยังไม่มีวันหยุดในภาคการศึกษานี้</p>
            ) : (
              <div className="space-y-2">
                {(holidays ?? []).map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{h.name}</p>
                      <p className="text-xs text-gray-500">{new Date(h.date).toISOString().slice(0, 10)}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => deleteHoliday(h.id)}>
                      ลบ
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
