"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader, Button, Card, Input, Alert } from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";

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
  const { data, loading, error, refetch } = useFetch<SystemSettings>("/system-settings");

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

  if (error) return <div><PageHeader title="ตั้งค่าระบบ" icon={<SlidersHorizontal size={20} />} /><Alert variant="danger">{error}</Alert></div>;

  return (
    <div>
      <PageHeader title="ตั้งค่าระบบ" subtitle="ค่าเริ่มต้นสำหรับการเช็คชื่อทุกรายวิชา (อาจารย์สามารถ override ได้)" icon={<SlidersHorizontal size={20} />} />

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
    </div>
  );
}
