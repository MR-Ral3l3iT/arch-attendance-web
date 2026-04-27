"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
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
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [filterStatus]);

  const url = `/leave-requests?page=${page}&limit=${LIMIT}${filterStatus ? `&status=${filterStatus}` : ""}`;
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
        <div className="flex items-center gap-3 mb-4">
          <Select options={STATUS_OPTIONS} value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LeaveRequestStatus | "")} className="w-44" />
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
