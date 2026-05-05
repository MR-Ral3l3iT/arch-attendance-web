"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Search, SlidersHorizontal, X } from "lucide-react";
import { PageHeader, Card, Table, Modal, Alert, Textarea, LeaveStatusBadge, Badge, Button, Select, Pagination } from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { LeaveRequest, LeaveRequestStatus, LeaveType, PaginatedResponse } from "@/types";

const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  SICK:     "ลาป่วย",
  PERSONAL: "ลากิจ",
};
const LEAVE_TYPE_VARIANT: Record<LeaveType, "danger" | "warning"> = {
  SICK:     "danger",
  PERSONAL: "warning",
};

const STATUS_OPTIONS = [
  { value: "", label: "ทุกสถานะ" },
  { value: "PENDING",  label: "รอดำเนินการ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "REJECTED", label: "ปฏิเสธแล้ว" },
];

const LIMIT = 20;

export default function TeacherLeaveRequestsPage() {
  const [filterStatus, setFilterStatus] = useState<LeaveRequestStatus | "">("");
  const [classDate,    setClassDate]    = useState("");
  const [search,       setSearch]       = useState("");
  const [searchQ,      setSearchQ]      = useState("");
  const [page,         setPage]         = useState(1);

  useEffect(() => { setPage(1); }, [filterStatus, classDate, searchQ]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(v: string) {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQ(v), 400);
  }

  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch(""); setSearchQ(""); setClassDate(""); setFilterStatus(""); setPage(1);
  }
  const hasFilter = !!(searchQ || classDate || filterStatus);

  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (filterStatus) params.set("status",    filterStatus);
  if (searchQ)      params.set("search",    searchQ);
  if (classDate)    params.set("classDate", classDate);
  const url = `/leave-requests?${params}`;

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<LeaveRequest>>(url);

  const [approveTarget, setApprove] = useState<LeaveRequest | null>(null);
  const [rejectTarget,  setReject]  = useState<LeaveRequest | null>(null);
  const [note, setNote]             = useState("");
  const [loading2, setLoading2]     = useState(false);
  const [detailItem, setDetail]     = useState<LeaveRequest | null>(null);

  async function handleApprove() {
    if (!approveTarget) return;
    setLoading2(true);
    try {
      await api.patch(`/leave-requests/${approveTarget.id}/approve`, { note: note.trim() || undefined });
      toast.success("อนุมัติคำขอลาสำเร็จ");
      setApprove(null); setNote(""); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setLoading2(false); }
  }

  async function handleReject() {
    if (!rejectTarget || !note.trim()) { toast.error("กรุณากรอกเหตุผลการปฏิเสธ"); return; }
    setLoading2(true);
    try {
      await api.patch(`/leave-requests/${rejectTarget.id}/reject`, { note: note.trim() });
      toast.success("ปฏิเสธคำขอลาแล้ว");
      setReject(null); setNote(""); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setLoading2(false); }
  }

  const rows = data?.data ?? [];
  const meta = data?.meta;

  if (error) return <div><PageHeader title="คำขอลา" icon={<FileText size={20} />} /><Alert variant="danger">{error}</Alert></div>;

  return (
    <div>
      <PageHeader title="คำขอลา" subtitle="จัดการคำขอลาของนักศึกษา" icon={<FileText size={20} />}
        actions={filterStatus === "PENDING" && meta?.total ? <Badge variant="warning">{meta.total} รายการ</Badge> : undefined}
      />
      <Card>
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ค้นหาชื่อ / รหัสนักศึกษา"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Date filter */}
          <div className="relative">
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-700"
            />
          </div>

          {/* Status filter */}
          <Select
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LeaveRequestStatus | "")}
            className="w-44"
          />

          {/* Clear */}
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
            >
              <X size={12} /> ล้าง
            </button>
          )}

          {meta && (
            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
              {meta.total} รายการ
            </span>
          )}
        </div>

        <Table data={rows} keyField="id" loading={loading} emptyMessage="ไม่มีคำขอลา"
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
            { key: "classDate", header: "วันที่ขาด", render: (r) => formatDate(r.classDate) },
            { key: "leaveType", header: "ประเภท", render: (r) => (
              <Badge variant={LEAVE_TYPE_VARIANT[r.leaveType]}>{LEAVE_TYPE_LABEL[r.leaveType]}</Badge>
            )},
            { key: "reason", header: "เหตุผล", render: (r) => (
              <p className="text-sm max-w-xs truncate" title={r.reason}>{r.reason}</p>
            )},
            { key: "evidence", header: "หลักฐาน", render: (r) => r.evidenceUrl
              ? <a href={r.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline">ดูไฟล์</a>
              : <span className="text-xs text-gray-400">ไม่มี</span>
            },
            { key: "status", header: "สถานะ", render: (r) => <LeaveStatusBadge status={r.status} /> },
            { key: "actions", header: "", render: (r) => (
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setDetail(r)}>รายละเอียด</Button>
                {r.status === "PENDING" && (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => { setApprove(r); setNote(""); }}>อนุมัติ</Button>
                    <Button variant="danger" size="sm" onClick={() => { setReject(r); setNote(""); }}>ปฏิเสธ</Button>
                  </>
                )}
              </div>
            )},
          ]}
        />

        <Pagination
          page={page}
          totalPages={meta?.totalPages ?? 0}
          total={meta?.total ?? 0}
          limit={LIMIT}
          onPageChange={setPage}
          className="mt-4"
        />
      </Card>

      {/* Detail Modal */}
      <Modal open={!!detailItem} onClose={() => setDetail(null)} title="รายละเอียดคำขอลา"
        footer={<Button variant="secondary" onClick={() => setDetail(null)}>ปิด</Button>}
      >
        {detailItem && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-gray-500 text-xs">นักศึกษา</p><p className="font-medium">{detailItem.student.firstName} {detailItem.student.lastName}</p></div>
              <div><p className="text-gray-500 text-xs">รหัส</p><p className="font-medium">{detailItem.student.code}</p></div>
              <div><p className="text-gray-500 text-xs">วิชา</p><p className="font-medium">{detailItem.schedule.section.course.name}</p></div>
              <div><p className="text-gray-500 text-xs">วันที่ขาด</p><p className="font-medium">{formatDate(detailItem.classDate)}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">ประเภทการลา</p><Badge variant={LEAVE_TYPE_VARIANT[detailItem.leaveType]}>{LEAVE_TYPE_LABEL[detailItem.leaveType]}</Badge></div>
            </div>
            <div><p className="text-gray-500 text-xs mb-1">เหตุผล</p><p className="bg-gray-50 rounded-lg p-3">{detailItem.reason}</p></div>
            {detailItem.evidenceUrl && (
              <div><p className="text-gray-500 text-xs mb-1">หลักฐาน</p>
                <a href={detailItem.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">ดูไฟล์หลักฐาน</a>
              </div>
            )}
            <div><p className="text-gray-500 text-xs">สถานะ</p><LeaveStatusBadge status={detailItem.status} /></div>
            {detailItem.reviewNote && (
              <div><p className="text-gray-500 text-xs mb-1">หมายเหตุผู้ตรวจ</p><p className="bg-gray-50 rounded-lg p-3">{detailItem.reviewNote}</p></div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal open={!!approveTarget} onClose={() => setApprove(null)} title="อนุมัติคำขอลา" size="sm"
        footer={<><Button variant="secondary" onClick={() => setApprove(null)}>ยกเลิก</Button>
          <Button onClick={handleApprove} loading={loading2}>อนุมัติ</Button></>}
      >
        <Textarea label="หมายเหตุ (ไม่บังคับ)" value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="ระบุหมายเหตุเพิ่มเติม..." />
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectTarget} onClose={() => setReject(null)} title="ปฏิเสธคำขอลา" size="sm"
        footer={<><Button variant="secondary" onClick={() => setReject(null)}>ยกเลิก</Button>
          <Button variant="danger" onClick={handleReject} loading={loading2}>ปฏิเสธ</Button></>}
      >
        <Textarea label="เหตุผลการปฏิเสธ" required value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="กรุณาระบุเหตุผล..." />
      </Modal>
    </div>
  );
}
