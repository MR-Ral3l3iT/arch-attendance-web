"use client";

import { useState, useEffect } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { PageHeader, Card, Table, Alert, AttendanceBadge, Button, Pagination } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { AttendanceRecord } from "@/types";

const LIMIT = 20;

export default function AttendanceFlagsPage() {
  const router = useRouter();
  const { data, loading, error } = useFetch<AttendanceRecord[]>("/attendance/flags");

  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = (data ?? []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.student.firstName.toLowerCase().includes(q) ||
      r.student.lastName.toLowerCase().includes(q) ||
      r.student.code.toLowerCase().includes(q) ||
      r.schedule.section.course.code.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div>
      <PageHeader title="รายการผิดปกติ" subtitle="บันทึกการเช็คชื่อที่ถูก flag ว่าอาจมีความผิดปกติ" icon={<AlertTriangle size={20} />} />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <div className="relative mb-4 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหานักศึกษา หรือรหัสวิชา..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>

        <Table data={paged} keyField="id" loading={loading} emptyMessage="ไม่มีรายการผิดปกติ"
          columns={[
            { key: "student", header: "นักศึกษา", render: (r) => (
              <div>
                <p className="text-sm font-medium">{r.student.firstName} {r.student.lastName}</p>
                <p className="text-xs text-gray-400">{r.student.code}</p>
              </div>
            )},
            { key: "course", header: "วิชา", render: (r) => (
              <div>
                <p className="text-sm">{r.schedule.section.course.code}</p>
                <p className="text-xs text-gray-400">{r.schedule.section.name}</p>
              </div>
            )},
            { key: "classDate", header: "วันที่", render: (r) => r.classDate },
            { key: "checkIn", header: "เวลาเช็คชื่อ", render: (r) => r.checkInTime ? formatDateTime(r.checkInTime) : "—" },
            { key: "status", header: "สถานะ", render: (r) => <AttendanceBadge status={r.status} /> },
            { key: "flags", header: "ความผิดปกติ", render: (r) => (
              <div className="text-xs text-warning space-y-0.5">
                {!r.selfieUrl && <p>• ไม่มีรูป Selfie</p>}
                {!r.latitude  && <p>• ไม่มีพิกัด GPS</p>}
                {r.isAnomalous && r.selfieUrl && r.latitude && <p>• ตำแหน่งนอกพื้นที่</p>}
              </div>
            )},
            { key: "actions", header: "", render: (r) => (
              <Button variant="ghost" size="sm"
                onClick={() => router.push(`/teacher/attendance/${r.schedule.id}?classDate=${r.classDate}`)}>
                ดูคาบ
              </Button>
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
    </div>
  );
}
