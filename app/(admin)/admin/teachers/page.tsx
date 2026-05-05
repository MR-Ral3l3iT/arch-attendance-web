"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, Search, UserCheck, X, SlidersHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PageHeader, Button, Card, Table, Modal, ConfirmModal,
  Input, Select, Alert, Pagination, Badge, Avatar,
} from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { Teacher, Department, PaginatedResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const teacherSchema = z.object({
  email:        z.string().email("รูปแบบ email ไม่ถูกต้อง"),
  firstName:    z.string().min(1, "กรุณากรอกชื่อ"),
  lastName:     z.string().min(1, "กรุณากรอกนามสกุล"),
  password:     z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร").optional().or(z.literal("")),
  teacherCode:  z.string().min(1, "กรุณากรอกรหัสอาจารย์"),
  departmentId: z.string().min(1, "กรุณาเลือกสาขา"),
  phone:        z.string().optional(),
});
type TeacherForm = z.infer<typeof teacherSchema>;

interface ImportResult { success: number; failed: number; errors: { row: number; message: string }[]; }

export default function TeachersPage() {
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [q, setQ]                       = useState("");
  const [filterDept, setFilterDept]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (q)            params.set("search", q);
  if (filterDept)   params.set("departmentId", filterDept);
  if (filterStatus) params.set("isActive", filterStatus === "active" ? "true" : "false");
  const url = `/teachers?${params}`;

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Teacher>>(url);
  const { data: departments }             = useFetch<Department[]>("/departments");

  const [modal, setModal]         = useState<{ open: boolean; item?: Teacher }>({ open: false });
  const [deleteTarget, setDelete] = useState<Teacher | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [importModal, setImport]  = useState(false);
  const [importFile, setFile]     = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setResult] = useState<ImportResult | null>(null);

  const deptOptions = (departments ?? []).map((d) => ({ value: d.id, label: d.name }));

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
  });

  useEffect(() => {
    if (modal.open) {
      reset(modal.item
        ? { email: modal.item.email ?? "", firstName: modal.item.firstName,
            lastName: modal.item.lastName, password: "", teacherCode: modal.item.code,
            departmentId: modal.item.department.id, phone: modal.item.phone ?? "" }
        : { email: "", firstName: "", lastName: "", password: "", teacherCode: "", departmentId: "", phone: "" });
    }
  }, [modal.open, modal.item, reset]);

  // debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setQ(value); setPage(1); }, 400);
  }

  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch(""); setQ("");
    setFilterDept(""); setFilterStatus("");
    setPage(1);
  }

  const hasFilter = !!(q || filterDept || filterStatus);

  async function onSubmit(v: TeacherForm) {
    const { teacherCode, ...rest } = v;
    const payload = {
      ...rest,
      code: teacherCode,
      username: teacherCode,
      ...(v.password === "" ? { password: undefined } : {}),
    };
    try {
      if (modal.item) {
        await api.patch(`/teachers/${modal.item.id}`, payload);
      } else {
        await api.post("/teachers", payload);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มอาจารย์สำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/teachers/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true); setResult(null);
    try {
      const form = new FormData();
      form.append("file", importFile);
      const { data: result } = await api.post<ImportResult>("/teachers/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(result);
      toast.success(`นำเข้าสำเร็จ ${result.success} รายการ`);
      refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setImporting(false); }
  }

  if (error) return <div><PageHeader title="จัดการอาจารย์" icon={<UserCheck size={20} />} /><Alert variant="danger">{error}</Alert></div>;

  return (
    <div>
      <PageHeader title="จัดการอาจารย์" icon={<UserCheck size={20} />}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Upload size={14} />}
              onClick={() => { setImport(true); setResult(null); setFile(null); }}>
              นำเข้า CSV
            </Button>
            <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มอาจารย์</Button>
          </>
        }
      />
      <Card>
        {/* Search + Filters — one row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ค้นหาชื่อ / รหัส / email"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Select
            options={[{ value: "", label: "ทุกสาขา" }, ...deptOptions]}
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="w-44"
          />
          <Select
            options={[
              { value: "",         label: "ทุกสถานะ" },
              { value: "active",   label: "ใช้งาน" },
              { value: "inactive", label: "ปิดใช้งาน" },
            ]}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="w-32"
          />
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
            >
              <X size={12} /> ล้าง
            </button>
          )}
          {data?.meta && (
            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
              {data.meta.total} รายการ
            </span>
          )}
        </div>

        <Table data={data?.data ?? []} keyField="id" loading={loading} emptyMessage="ไม่พบข้อมูลอาจารย์"
          columns={[
            { key: "avatar", header: "", className: "w-10", render: (r) => (
              <Avatar
                src={r.profileImageUrl ? `${API_URL}${r.profileImageUrl}` : null}
                name={`${r.firstName} ${r.lastName}`}
                size="sm"
              />
            )},
            { key: "code", header: "รหัส", className: "w-24", render: (r) => r.code },
            { key: "name", header: "ชื่อ-นามสกุล", render: (r) => `${r.firstName} ${r.lastName}` },
            { key: "email", header: "Email", render: (r) => r.email ?? "—" },
            { key: "dept", header: "สาขา", render: (r) => r.department.name },
            { key: "status", header: "สถานะ", render: (r) => (
              <Badge variant={r.user.isActive ? "success" : "secondary"}>
                {r.user.isActive ? "ใช้งาน" : "ปิด"}
              </Badge>
            )},
            { key: "actions", header: "", render: (r) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => setModal({ open: true, item: r })}><Pencil size={14} /></Button>
                <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => setDelete(r)}><Trash2 size={14} /></Button>
              </div>
            )},
          ]}
        />

        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={data?.meta?.totalPages ?? 0}
            total={data?.meta?.total ?? 0}
            limit={data?.meta?.limit ?? 20}
            onPageChange={setPage}
          />
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false })} size="lg"
        title={modal.item ? "แก้ไขข้อมูลอาจารย์" : "เพิ่มอาจารย์"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="teacher-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="teacher-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อ" required error={errors.firstName?.message} {...register("firstName")} />
            <Input label="นามสกุล" required error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="รหัสอาจารย์" required error={errors.teacherCode?.message} {...register("teacherCode")} />
            <Input label="เบอร์โทรศัพท์" error={errors.phone?.message} {...register("phone")} />
          </div>
          <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
          <Input label={modal.item ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน"}
            type="password" required={!modal.item} error={errors.password?.message} {...register("password")} />
          <Select label="สาขา" required options={deptOptions} placeholder="เลือกสาขา"
            error={errors.departmentId?.message} {...register("departmentId")} />
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal open={importModal} onClose={() => setImport(false)} title="นำเข้าอาจารย์ (CSV)"
        footer={<><Button variant="secondary" onClick={() => setImport(false)}>ปิด</Button>
          <Button onClick={handleImport} loading={importing} disabled={!importFile}>นำเข้า</Button></>}
      >
        <div className="space-y-4">
          <Alert variant="info" title="รูปแบบไฟล์ CSV">
            คอลัมน์ที่จำเป็น: email, firstName, lastName, password, teacherCode, departmentCode
          </Alert>
          <Input label="เลือกไฟล์ CSV" type="file" accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {importResult && (
            <div className="space-y-2">
              <Alert variant={importResult.failed > 0 ? "warning" : "success"}>
                สำเร็จ {importResult.success} รายการ | ล้มเหลว {importResult.failed} รายการ
              </Alert>
              {importResult.errors.length > 0 && (
                <div className="text-xs space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-danger">แถว {e.row}: {e.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบอาจารย์" description={`ต้องการลบ ${deleteTarget?.firstName} ${deleteTarget?.lastName} ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </div>
  );
}
