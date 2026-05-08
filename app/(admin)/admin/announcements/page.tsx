"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { PageHeader, Card, Select, Input, Textarea, Button, Table, Badge, Pagination } from "@/components/ui";
import { parseApiError, useFetch } from "@/hooks/useFetch";
import api from "@/lib/api";
import { toast } from "@/store/toast.store";
import type { Faculty, Department } from "@/types";

type AnnouncementType = "GENERAL" | "CANCEL_CLASS" | "EXAM" | "RESCHEDULE";

interface AdminAnnouncementHistory {
  id: string;
  type: AnnouncementType;
  title: string;
  body: string;
  sentAt: string;
  sentCount: number;
  readCount: number;
  facultyId?: string;
  departmentId?: string;
  yearLevelId?: string;
}

interface AdminAnnouncementHistoryResponse {
  announcements: AdminAnnouncementHistory[];
}

interface YearLevelData {
  id: string;
  level: number;
  name: string;
}

const TYPE_LABEL: Record<AnnouncementType, string> = {
  GENERAL: "ทั่วไป",
  CANCEL_CLASS: "ยกคลาส",
  EXAM: "สอบ/ทดสอบ",
  RESCHEDULE: "เลื่อนเวลาเรียน",
};

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<AnnouncementType>("GENERAL");
  const [sending, setSending] = useState(false);
  const [filterType, setFilterType] = useState<AnnouncementType | "">("");
  const [targetFaculty, setTargetFaculty] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [targetYearLevel, setTargetYearLevel] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: faculties } = useFetch<Faculty[]>("/faculties");
  const { data: departments } = useFetch<Department[]>("/departments");
  const { data: yearLevels } = useFetch<YearLevelData[]>("/year-levels");

  const params = useMemo(() => {
    const q = new URLSearchParams();
    if (filterType) q.set("type", filterType);
    return q.toString();
  }, [filterType]);

  const historyUrl = `/notifications/admin/history${params ? `?${params}` : ""}`;
  const history = useFetch<AdminAnnouncementHistoryResponse>(historyUrl);
  const rows = history.data?.announcements ?? [];
  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  const pagedRows = rows.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const facultyOptions = [{ value: "", label: "ทุกคณะ" }, ...((faculties ?? []).map((f) => ({ value: f.id, label: f.name })))];
  const departmentOptions = [{ value: "", label: "ทุกสาขา" }, ...((departments ?? [])
    .filter((d) => !targetFaculty || d.faculty.id === targetFaculty)
    .map((d) => ({ value: d.id, label: d.name })))];
  const yearLevelOptions = [{ value: "", label: "ทุกชั้นปี" }, ...((yearLevels ?? []).map((y) => ({ value: y.id, label: y.name })))];
  const facultyNameById = new Map((faculties ?? []).map((f) => [f.id, f.name]));
  const departmentNameById = new Map((departments ?? []).map((d) => [d.id, d.name]));
  const yearLevelNameById = new Map((yearLevels ?? []).map((y) => [y.id, y.name]));

  async function onSubmit() {
    if (!title.trim() || !body.trim()) {
      toast.warning("กรุณากรอกหัวข้อและรายละเอียดให้ครบ");
      return;
    }
    try {
      setSending(true);
      const { data } = await api.post<{ sent: number; pushSent: number }>("/notifications/announce-all", {
        title: title.trim(),
        body: body.trim(),
        type,
        ...(targetFaculty ? { facultyId: targetFaculty } : {}),
        ...(targetDepartment ? { departmentId: targetDepartment } : {}),
        ...(targetYearLevel ? { yearLevelId: targetYearLevel } : {}),
      });
      toast.success(`ส่งประกาศสำเร็จ ส่งในระบบ ${data.sent} คน (Push ${data.pushSent} คน)`);
      setTitle("");
      setBody("");
      setType("GENERAL");
      setTargetFaculty("");
      setTargetDepartment("");
      setTargetYearLevel("");
      setPage(1);
      await history.refetch();
    } catch (e) {
      toast.error(parseApiError(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="แจ้งข่าวส่วนกลาง"
        subtitle="ส่งประกาศจาก Admin ไปยังแอปนักศึกษาทั้งหมด"
        icon={<Megaphone size={20} />}
      />

      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">ส่งประกาศใหม่</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Input
            label="หัวข้อประกาศ"
            placeholder="เช่น แจ้งปิดระบบชั่วคราว"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-2"
            required
          />
          <Select
            label="ประเภท"
            value={type}
            onChange={(e) => setType(e.target.value as AnnouncementType)}
            options={[
              { value: "GENERAL", label: "ทั่วไป" },
              { value: "EXAM", label: "สอบ/ทดสอบ" },
              { value: "RESCHEDULE", label: "เลื่อนเวลาเรียน" },
              { value: "CANCEL_CLASS", label: "ยกคลาส" },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Select
            label="คณะ (กลุ่มเป้าหมาย)"
            value={targetFaculty}
            onChange={(e) => {
              setTargetFaculty(e.target.value);
              setTargetDepartment("");
            }}
            options={facultyOptions}
          />
          <Select
            label="สาขา (กลุ่มเป้าหมาย)"
            value={targetDepartment}
            onChange={(e) => setTargetDepartment(e.target.value)}
            options={departmentOptions}
          />
          <Select
            label="ชั้นปี (กลุ่มเป้าหมาย)"
            value={targetYearLevel}
            onChange={(e) => setTargetYearLevel(e.target.value)}
            options={yearLevelOptions}
          />
        </div>
        <Textarea
          label="รายละเอียด"
          placeholder="ระบุรายละเอียดข่าวสารที่ต้องการแจ้งนักศึกษา"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={onSubmit} loading={sending}>
            ส่งประกาศถึงนักศึกษาทั้งหมด
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">ประวัติการแจ้งข่าว</h3>
          <Select
            className="w-52"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as AnnouncementType | "");
              setPage(1);
            }}
            options={[
              { value: "", label: "ทุกประเภท" },
              { value: "GENERAL", label: "ทั่วไป" },
              { value: "EXAM", label: "สอบ/ทดสอบ" },
              { value: "RESCHEDULE", label: "เลื่อนเวลาเรียน" },
              { value: "CANCEL_CLASS", label: "ยกคลาส" },
            ]}
          />
        </div>
        <Table
          data={pagedRows}
          keyField="id"
          loading={history.loading}
          emptyMessage="ยังไม่มีประวัติการแจ้งข่าว"
          columns={[
            {
              key: "type",
              header: "ประเภท",
              render: (r) => (
                <Badge variant={r.type === "CANCEL_CLASS" ? "warning" : "secondary"}>
                  {TYPE_LABEL[r.type]}
                </Badge>
              ),
            },
            {
              key: "title",
              header: "หัวข้อ",
              render: (r) => (
                <div>
                  <p className="font-medium text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[460px]">{r.body}</p>
                </div>
              ),
            },
            {
              key: "sent",
              header: "ส่ง/อ่าน",
              render: (r) => `${r.readCount}/${r.sentCount}`,
            },
            {
              key: "target",
              header: "กลุ่มเป้าหมาย",
              render: (r) => {
                const hasAnyTarget = !!(r.facultyId || r.departmentId || r.yearLevelId);
                if (!hasAnyTarget) return <Badge variant="info">นักศึกษาทั้งหมด</Badge>;
                return (
                  <div className="flex flex-wrap gap-1">
                    {r.facultyId && (
                      <Badge variant="secondary">
                        คณะ: {facultyNameById.get(r.facultyId) ?? "—"}
                      </Badge>
                    )}
                    {r.departmentId && (
                      <Badge variant="secondary">
                        สาขา: {departmentNameById.get(r.departmentId) ?? "—"}
                      </Badge>
                    )}
                    {r.yearLevelId && (
                      <Badge variant="secondary">
                        ชั้นปี: {yearLevelNameById.get(r.yearLevelId) ?? "—"}
                      </Badge>
                    )}
                  </div>
                );
              },
            },
            {
              key: "sentAt",
              header: "เวลาส่ง",
              render: (r) => new Date(r.sentAt).toLocaleString("th-TH"),
            },
          ]}
        />
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={rows.length}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
