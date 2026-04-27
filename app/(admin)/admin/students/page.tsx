"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, Search, Smartphone, Download, FileSpreadsheet, Users, X, SlidersHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PageHeader, Button, Card, Table, Modal, ConfirmModal,
  Input, Select, Alert, Pagination, Badge, Avatar,
} from "@/components/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { Student, Department, PaginatedResponse } from "@/types";

const studentSchema = z.object({
  email:        z.string().email("รูปแบบ email ไม่ถูกต้อง"),
  firstName:    z.string().min(1, "กรุณากรอกชื่อ"),
  lastName:     z.string().min(1, "กรุณากรอกนามสกุล"),
  studentCode:  z.string().min(1, "กรุณากรอกรหัสนักศึกษา"),
  departmentId: z.string().min(1, "กรุณาเลือกสาขา"),
  yearLevelId:  z.string().optional(),
  phone:        z.string().optional(),
});
type StudentForm = z.infer<typeof studentSchema>;

interface ImportResult { success: number; failed: number; errors: { row: number; message: string }[]; }
interface YearLevelData { id: string; level: number; name: string; }

export default function StudentsPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [q, setQ]                 = useState("");
  const [filterDept, setFilterDept]     = useState("");
  const [filterYear, setFilterYear]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (q)            params.set("search", q);
  if (filterDept)   params.set("departmentId", filterDept);
  if (filterYear)   params.set("yearLevelId", filterYear);
  if (filterStatus) params.set("isActive", filterStatus === "active" ? "true" : "false");
  const url = `/students?${params}`;

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Student>>(url);
  const { data: departments } = useFetch<Department[]>("/departments");
  const { data: yearLevels }  = useFetch<YearLevelData[]>("/year-levels");

  const [modal, setModal]             = useState<{ open: boolean; item?: Student }>({ open: false });
  const [deleteTarget, setDelete]     = useState<Student | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [deviceReset, setDeviceReset] = useState<Student | null>(null);
  const [resetting, setResetting]     = useState(false);
  const [importModal, setImport]      = useState(false);
  const [importFile, setFile]         = useState<File | null>(null);
  const [importing, setImporting]     = useState(false);
  const [importResult, setResult]     = useState<ImportResult | null>(null);
  const [downloadingTpl, setDlTpl]    = useState(false);

  const deptOptions = (departments ?? []).map((d) => ({ value: d.id, label: d.name }));
  const ylOptions   = (yearLevels ?? []).map((y) => ({ value: y.id, label: y.name }));

  // debounce: พิมพ์หยุด 400ms → ค้นหาอัตโนมัติ
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setQ(value); setPage(1); }, 400);
  }

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    if (modal.open) {
      reset(modal.item
        ? { email: modal.item.email ?? "", firstName: modal.item.firstName,
            lastName: modal.item.lastName,
            studentCode: modal.item.code, departmentId: modal.item.department.id,
            yearLevelId: modal.item.yearLevel?.id ?? "", phone: modal.item.phone ?? "" }
        : { email: "", firstName: "", lastName: "", studentCode: "", departmentId: "", yearLevelId: "", phone: "" });
    }
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: StudentForm) {
    const { studentCode, ...rest } = v;
    const payload = {
      ...rest,
      code: studentCode,
      // username = email, password = รหัสนักศึกษา (auto โดย API)
      ...(v.yearLevelId === "" ? { yearLevelId: undefined } : {}),
    };
    try {
      if (modal.item) {
        await api.put(`/students/${modal.item.id}`, payload);
      } else {
        await api.post("/students", payload);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มนักศึกษาสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/students/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  async function onDeviceReset() {
    if (!deviceReset) return;
    setResetting(true);
    try {
      await api.patch(`/students/${deviceReset.id}/device/reset`);
      toast.success("รีเซ็ต Device Binding สำเร็จ");
      setDeviceReset(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setResetting(false); }
  }

  // ── Excel template download (with real dropdown validation) ────────────────
  async function handleDownloadTemplate() {
    setDlTpl(true);
    try {
      const xlsxMod = await import("xlsx");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const XLSX = (xlsxMod as any).default ?? xlsxMod;
      const { strToU8, strFromU8, unzipSync, zipSync } = await import("fflate");

      const deptCodes = (departments ?? []).map((d) => d.code).filter(Boolean);
      const ylValues  = (yearLevels ?? []).map((y) => String(y.level));

      const wb = XLSX.utils.book_new();

      // ── Sheet 1: data entry ──
      // password ไม่ต้องระบุ — API จะใช้ studentCode เป็น password อัตโนมัติ
      const headers = ["email", "firstName", "lastName", "studentCode", "departmentCode", "yearLevel", "phone"];
      const example1 = [
        "somchai@example.com", "สมชาย", "ใจดี", "6701001",
        deptCodes[0] ?? "CS", ylValues[0] ?? "1", "0812345678",
      ];
      const example2 = [
        "somsri@example.com", "สมศรี", "รักเรียน", "6701002",
        deptCodes[1] ?? deptCodes[0] ?? "CS", ylValues[0] ?? "1", "",
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, example1, example2]);
      ws["!cols"] = [
        { wch: 28 }, { wch: 14 }, { wch: 14 },
        { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 14 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "นักศึกษา");

      // ── Sheet 2: department reference ──
      const deptRows: (string | number)[][] = [
        ["departmentCode", "ชื่อสาขา", "คณะ"],
        ...(departments ?? []).map((d) => [d.code, d.name, d.faculty?.name ?? ""]),
      ];
      const deptWs = XLSX.utils.aoa_to_sheet(deptRows);
      deptWs["!cols"] = [{ wch: 16 }, { wch: 30 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, deptWs, "สาขา (อ้างอิง)");

      // ── Sheet 3: year level reference ──
      const ylRows: (string | number)[][] = [
        ["yearLevel", "ชื่อชั้นปี"],
        ...(yearLevels ?? []).map((y) => [y.level, y.name]),
      ];
      const ylWs = XLSX.utils.aoa_to_sheet(ylRows);
      ylWs["!cols"] = [{ wch: 12 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ylWs, "ชั้นปี (อ้างอิง)");

      // Write xlsx → Uint8Array (no data-validation yet)
      const raw = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as Uint8Array;

      // ── Inject <dataValidations> into sheet1.xml via ZIP manipulation ──────
      const files = unzipSync(raw);

      // Find the sheet1 XML key (xl/worksheets/sheet1.xml or similar)
      const sheetKey = Object.keys(files).find(
        (k) => k.startsWith("xl/worksheets/sheet") && k.endsWith(".xml")
      );

      if (sheetKey) {
        let sheetXml = strFromU8(files[sheetKey]);

        // Build dataValidations XML
        const dvDeptFormula = deptCodes.length
          ? `&quot;${deptCodes.join(",")}&quot;`
          : "&quot;CS,IT,ENG&quot;";
        const dvYlFormula = ylValues.length
          ? `&quot;${ylValues.join(",")}&quot;`
          : "&quot;1,2,3,4&quot;";

        // headers: email(A) firstName(B) lastName(C) studentCode(D) departmentCode(E) yearLevel(F) phone(G)
        const dvXml = [
          `<dataValidations count="2">`,
          `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="E2:E10000">`,
          `<formula1>${dvDeptFormula}</formula1>`,
          `</dataValidation>`,
          `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="F2:F10000">`,
          `<formula1>${dvYlFormula}</formula1>`,
          `</dataValidation>`,
          `</dataValidations>`,
        ].join("");

        // Insert before </worksheet> (end tag)
        sheetXml = sheetXml.replace("</worksheet>", `${dvXml}</worksheet>`);
        files[sheetKey] = strToU8(sheetXml);
      }

      const patched = zipSync(files, { level: 6 });
      const blob = new Blob([patched.buffer as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("ดาวน์โหลด Template สำเร็จ");
    } catch (err) {
      console.error("Template download error:", err);
      toast.error("ดาวน์โหลดล้มเหลว");
    } finally {
      setDlTpl(false);
    }
  }

  // ── Import (CSV or Excel → API expects CSV) ────────────────────────────────
  async function handleImport() {
    if (!importFile) return;
    setImporting(true); setResult(null);
    try {
      let fileToSend = importFile;

      // Convert Excel to CSV before sending
      if (/\.xlsx?$/i.test(importFile.name)) {
        const xlsxMod = await import("xlsx");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const XLSX = (xlsxMod as any).default ?? xlsxMod;
        const arrayBuf = await importFile.arrayBuffer();
        const wb = XLSX.read(new Uint8Array(arrayBuf), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv" });
        fileToSend = new File([blob], importFile.name.replace(/\.xlsx?$/i, ".csv"), { type: "text/csv" });
      }

      const form = new FormData();
      form.append("file", fileToSend);
      const { data: result } = await api.post<ImportResult>("/students/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(result);
      toast.success(`นำเข้าสำเร็จ ${result.success} รายการ`);
      refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setImporting(false); }
  }

  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch(""); setQ("");
    setFilterDept(""); setFilterYear(""); setFilterStatus("");
    setPage(1);
  }

  const hasFilter = !!(q || filterDept || filterYear || filterStatus);

  if (error) return <div><PageHeader title="จัดการนักศึกษา" icon={<Users size={20} />} /><Alert variant="danger">{error}</Alert></div>;

  return (
    <div>
      <PageHeader title="จัดการนักศึกษา" icon={<Users size={20} />}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Upload size={14} />}
              onClick={() => { setImport(true); setResult(null); setFile(null); }}>
              นำเข้าข้อมูล
            </Button>
            <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มนักศึกษา</Button>
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
            className="w-40"
          />
          <Select
            options={[{ value: "", label: "ทุกชั้นปี" }, ...ylOptions]}
            value={filterYear}
            onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
            className="w-32"
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

        <Table data={data?.data ?? []} keyField="id" loading={loading} emptyMessage="ไม่พบข้อมูลนักศึกษา"
          columns={[
            { key: "avatar", header: "", className: "w-10", render: (r) => (
              <Avatar
                src={r.profileImageUrl ? `${API_URL}${r.profileImageUrl}` : null}
                name={`${r.firstName} ${r.lastName}`}
                size="sm"
              />
            )},
            { key: "code", header: "รหัส", className: "w-28", render: (r) => r.code },
            { key: "name", header: "ชื่อ-นามสกุล", render: (r) => `${r.firstName} ${r.lastName}` },
            { key: "email", header: "Email", render: (r) => r.email ?? "—" },
            { key: "dept", header: "สาขา", render: (r) => r.department.name },
            { key: "year", header: "ชั้นปี", render: (r) => r.yearLevel?.name ?? "—" },
            { key: "device", header: "Device", render: (r) => (
              <Badge variant={r.deviceId ? "info" : "secondary"}>{r.deviceId ? "ผูกแล้ว" : "ยังไม่ผูก"}</Badge>
            )},
            { key: "status", header: "สถานะ", render: (r) => (
              <Badge variant={r.user?.isActive ? "success" : "secondary"}>{r.user?.isActive ? "ใช้งาน" : "ปิด"}</Badge>
            )},
            { key: "actions", header: "", render: (r) => (
              <div className="flex justify-end gap-1">
                {r.deviceId && (
                  <Button variant="ghost" size="sm" title="Reset Device" onClick={() => setDeviceReset(r)}><Smartphone size={14} /></Button>
                )}
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
        title={modal.item ? "แก้ไขข้อมูลนักศึกษา" : "เพิ่มนักศึกษา"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="student-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="ชื่อ" required error={errors.firstName?.message} {...register("firstName")} />
            <Input label="นามสกุล" required error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="รหัสนักศึกษา" required error={errors.studentCode?.message} {...register("studentCode")} />
            <Input label="เบอร์โทรศัพท์" error={errors.phone?.message} {...register("phone")} />
          </div>
          <Input label="Email (ใช้เข้าสู่ระบบ)" type="email" required error={errors.email?.message} {...register("email")} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="สาขา" required options={deptOptions} placeholder="เลือกสาขา"
              error={errors.departmentId?.message} {...register("departmentId")} />
            <Select label="ชั้นปี" options={ylOptions} placeholder="เลือกชั้นปี" {...register("yearLevelId")} />
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal open={importModal} onClose={() => setImport(false)} size="lg"
        title="นำเข้านักศึกษา"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}
              onClick={handleDownloadTemplate} loading={downloadingTpl}
              disabled={!departments || !yearLevels}>
              ดาวน์โหลด Template
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setImport(false)}>ปิด</Button>
              <Button onClick={handleImport} loading={importing} disabled={!importFile}>นำเข้า</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Format info */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-primary shrink-0" />
              <p className="text-sm font-semibold text-primary">รูปแบบไฟล์ที่รองรับ</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-900">ไฟล์:</span>
                <span>CSV (.csv) หรือ Excel (.xlsx)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-900">แถวแรก:</span>
                <span>หัวคอลัมน์ (header)</span>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-900 mb-1">คอลัมน์ที่จำเป็น:</p>
              <div className="flex flex-wrap gap-1.5">
                {["email","firstName","lastName","studentCode","departmentCode","yearLevel","phone"].map((col) => (
                  <code key={col} className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[11px] font-mono text-gray-700">
                    {col}
                  </code>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              ดาวน์โหลด Template เพื่อรับไฟล์ตัวอย่างที่มี dropdown สาขาและชั้นปีจากระบบ
            </p>
          </div>

          {/* File input */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">เลือกไฟล์</p>
            <label className="flex items-center gap-3 w-full h-10 px-3 rounded-lg border border-gray-300 bg-white cursor-pointer hover:border-primary/50 transition-colors">
              <Upload size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 flex-1 truncate">
                {importFile ? importFile.name : "เลือกไฟล์ CSV หรือ Excel..."}
              </span>
              <input type="file" accept=".csv,.xlsx,.xls" className="sr-only"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }} />
            </label>
          </div>

          {/* Import result */}
          {importResult && (
            <div className="space-y-2">
              <Alert variant={importResult.failed > 0 ? "warning" : "success"}>
                สำเร็จ {importResult.success} | ล้มเหลว {importResult.failed} รายการ
              </Alert>
              {importResult.errors.length > 0 && (
                <div className="text-xs space-y-1 max-h-40 overflow-y-auto scrollbar-thin bg-gray-50 rounded-lg p-3">
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
        title="ลบนักศึกษา" description={`ต้องการลบ ${deleteTarget?.firstName} ${deleteTarget?.lastName} ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />

      <ConfirmModal open={!!deviceReset} onClose={() => setDeviceReset(null)} onConfirm={onDeviceReset}
        title="รีเซ็ต Device Binding"
        description={`รีเซ็ต device ของ ${deviceReset?.firstName} ${deviceReset?.lastName}? นักศึกษาจะต้องล็อกอินใหม่เพื่อผูก device ใหม่`}
        confirmVariant="danger" confirmLabel="รีเซ็ต" loading={resetting} />
    </div>
  );
}
