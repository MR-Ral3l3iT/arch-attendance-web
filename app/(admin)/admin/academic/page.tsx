"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PageHeader, Button, Card, Tabs, Table, Modal, ConfirmModal,
  Input, Select, Badge, Alert, Pagination,
} from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import { Search } from "lucide-react";
import type { AcademicYear, Semester, Faculty, Division, Department } from "@/types";

const LIMIT = 20;

// ─── Academic Years ───────────────────────────────────────────────────────────

const yearSchema = z.object({
  name:      z.string().min(1, "กรุณากรอกชื่อปีการศึกษา").max(32),
  startDate: z.string().min(1, "กรุณาเลือกวันเริ่มต้น"),
  endDate:   z.string().min(1, "กรุณาเลือกวันสิ้นสุด"),
  isActive:  z.boolean(),
});
type YearForm = z.infer<typeof yearSchema>;

function AcademicYearsSection() {
  const { data, loading, error, refetch } = useFetch<AcademicYear[]>("/academic-years");
  const [modal, setModal]         = useState<{ open: boolean; item?: AcademicYear }>({ open: false });
  const [deleteTarget, setDelete] = useState<AcademicYear | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<YearForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(yearSchema) as any,
  });

  useEffect(() => {
    if (modal.open) {
      reset(
        modal.item
          ? {
              name: modal.item.name,
              startDate: modal.item.startDate.slice(0, 10),
              endDate: modal.item.endDate.slice(0, 10),
              isActive: modal.item.isActive,
            }
          : {
              name: String(new Date().getFullYear() + 543),
              startDate: "",
              endDate: "",
              isActive: true,
            }
      );
    }
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: YearForm) {
    try {
      if (modal.item) {
        await api.put(`/academic-years/${modal.item.id}`, v);
      } else {
        await api.post("/academic-years", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มปีการศึกษาสำเร็จ");
      setModal({ open: false });
      refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/academic-years/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ");
      setDelete(null);
      refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const filtered = (data ?? []).filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาปีการศึกษา..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>
          เพิ่มปีการศึกษา
        </Button>
      </div>
      <Table
        data={paged} keyField="id" loading={loading}
        emptyMessage="ยังไม่มีข้อมูลปีการศึกษา"
        columns={[
          { key: "name", header: "ปีการศึกษา (พ.ศ.)", render: (r) => r.name },
          {
            key: "range",
            header: "ช่วงวันที่",
            render: (r) => `${r.startDate.slice(0, 10)} – ${r.endDate.slice(0, 10)}`,
          },
          { key: "isActive", header: "สถานะ", render: (r) => (
            <Badge variant={r.isActive ? "success" : "secondary"}>{r.isActive ? "ใช้งาน" : "ปิดใช้งาน"}</Badge>
          )},
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
      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขปีการศึกษา" : "เพิ่มปีการศึกษา"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="year-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="year-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="ชื่อปีการศึกษา (พ.ศ.)" required hint="เช่น 2568"
            error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="วันเริ่มต้นปีการศึกษา" type="date" required error={errors.startDate?.message} {...register("startDate")} />
            <Input label="วันสิ้นสุดปีการศึกษา" type="date" required error={errors.endDate?.message} {...register("endDate")} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" {...register("isActive")} className="w-4 h-4 rounded accent-primary" />
            ปีการศึกษาปัจจุบัน
          </label>
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบปีการศึกษา" description={`ต้องการลบปีการศึกษา ${deleteTarget?.name} ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Semesters ────────────────────────────────────────────────────────────────

const semesterSchema = z.object({
  academicYearId: z.string().min(1, "กรุณาเลือกปีการศึกษา"),
  name:           z.string().min(1, "กรุณากรอกชื่อภาคการศึกษา"),
  startDate:      z.string().min(1, "กรุณาเลือกวันเริ่มต้น"),
  endDate:        z.string().min(1, "กรุณาเลือกวันสิ้นสุด"),
  isActive:       z.boolean(),
});
type SemesterForm = z.infer<typeof semesterSchema>;

function SemestersSection() {
  const { data: years } = useFetch<AcademicYear[]>("/academic-years");
  const [filterYear, setFilterYear] = useState("");
  const url = filterYear ? `/semesters?academicYearId=${filterYear}` : "/semesters";
  const { data, loading, error, refetch } = useFetch<Semester[]>(url);
  const [modal, setModal]         = useState<{ open: boolean; item?: Semester }>({ open: false });
  const [deleteTarget, setDelete] = useState<Semester | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search, filterYear]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SemesterForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(semesterSchema) as any,
  });

  useEffect(() => {
    if (modal.open) {
      reset(
        modal.item
          ? {
              academicYearId: modal.item.academicYear.id,
              name: modal.item.name,
              startDate: modal.item.startDate.slice(0, 10),
              endDate: modal.item.endDate.slice(0, 10),
              isActive: modal.item.isActive,
            }
          : { academicYearId: "", name: "", startDate: "", endDate: "", isActive: false }
      );
    }
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: SemesterForm) {
    try {
      if (modal.item) {
        await api.put(`/semesters/${modal.item.id}`, v);
      } else {
        await api.post("/semesters", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มภาคการศึกษาสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/semesters/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const yearOptions = (years ?? []).map((y) => ({ value: y.id, label: `ปีการศึกษา ${y.name}` }));
  const filtered = (data ?? []).filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Select options={[{ value: "", label: "ทุกปีการศึกษา" }, ...yearOptions]}
            value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-44" />
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาภาคการศึกษา..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มภาคการศึกษา</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ไม่พบข้อมูล"
        columns={[
          { key: "name", header: "ชื่อภาคการศึกษา" },
          { key: "academicYear", header: "ปีการศึกษา", render: (r) => r.academicYear.name },
          { key: "startDate", header: "เริ่ม–สิ้นสุด", render: (r) => `${r.startDate.slice(0,10)} – ${r.endDate.slice(0,10)}` },
          { key: "isActive", header: "สถานะ", render: (r) => <Badge variant={r.isActive ? "success" : "secondary"}>{r.isActive ? "ใช้งาน" : "ปิด"}</Badge> },
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
      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขภาคการศึกษา" : "เพิ่มภาคการศึกษา"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="sem-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="sem-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="ปีการศึกษา" required options={yearOptions} placeholder="เลือกปีการศึกษา"
            error={errors.academicYearId?.message} {...register("academicYearId")} />
          <Input label="ชื่อภาคการศึกษา" required placeholder="เช่น 1, 2, ฤดูร้อน"
            error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="วันเริ่มต้น" type="date" required error={errors.startDate?.message} {...register("startDate")} />
            <Input label="วันสิ้นสุด" type="date" required error={errors.endDate?.message} {...register("endDate")} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" {...register("isActive")} className="w-4 h-4 rounded accent-primary" />
            ภาคการศึกษาปัจจุบัน
          </label>
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบภาคการศึกษา" description={`ต้องการลบ "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Faculties ────────────────────────────────────────────────────────────────

const facultySchema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัส"),
  name: z.string().min(1, "กรุณากรอกชื่อ"),
});
type FacultyForm = z.infer<typeof facultySchema>;

function FacultiesSection() {
  const { data, loading, error, refetch } = useFetch<Faculty[]>("/faculties");
  const [modal, setModal]         = useState<{ open: boolean; item?: Faculty }>({ open: false });
  const [deleteTarget, setDelete] = useState<Faculty | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FacultyForm>({
    resolver: zodResolver(facultySchema),
  });

  useEffect(() => {
    if (modal.open) reset(modal.item ? { code: modal.item.code, name: modal.item.name } : { code: "", name: "" });
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: FacultyForm) {
    try {
      if (modal.item) {
        await api.put(`/faculties/${modal.item.id}`, v);
      } else {
        await api.post("/faculties", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มคณะสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/faculties/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const filtered = (data ?? []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัส หรือชื่อคณะ..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มคณะ</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีข้อมูลคณะ"
        columns={[
          { key: "code", header: "รหัส", className: "w-24" },
          { key: "name", header: "ชื่อคณะ" },
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
      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขคณะ" : "เพิ่มคณะ"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="faculty-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="faculty-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="รหัสคณะ" required placeholder="เช่น ENG" error={errors.code?.message} {...register("code")} />
          <Input label="ชื่อคณะ" required placeholder="เช่น คณะวิศวกรรมศาสตร์" error={errors.name?.message} {...register("name")} />
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบคณะ" description={`ต้องการลบคณะ "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Divisions ────────────────────────────────────────────────────────────────

const divisionSchema = z.object({
  code:      z.string().min(1, "กรุณากรอกรหัส"),
  name:      z.string().min(1, "กรุณากรอกชื่อ"),
  facultyId: z.string().min(1, "กรุณาเลือกคณะ"),
});
type DivisionForm = z.infer<typeof divisionSchema>;

function DivisionsSection() {
  const { data: faculties } = useFetch<Faculty[]>("/faculties");
  const [filterFaculty, setFilter] = useState("");
  const url = filterFaculty ? `/divisions?facultyId=${filterFaculty}` : "/divisions";
  const { data, loading, error, refetch } = useFetch<Division[]>(url);
  const [modal, setModal]         = useState<{ open: boolean; item?: Division }>({ open: false });
  const [deleteTarget, setDelete] = useState<Division | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search, filterFaculty]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DivisionForm>({
    resolver: zodResolver(divisionSchema),
  });

  useEffect(() => {
    if (modal.open) reset(modal.item
      ? { code: modal.item.code, name: modal.item.name, facultyId: modal.item.faculty.id }
      : { code: "", name: "", facultyId: "" });
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: DivisionForm) {
    try {
      if (modal.item) {
        await api.put(`/divisions/${modal.item.id}`, v);
      } else {
        await api.post("/divisions", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มภาควิชาสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/divisions/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const facultyOptions = (faculties ?? []).map((f) => ({ value: f.id, label: f.name }));
  const filtered = (data ?? []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Select options={[{ value: "", label: "ทุกคณะ" }, ...facultyOptions]}
            value={filterFaculty} onChange={(e) => setFilter(e.target.value)} className="w-44" />
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัส หรือชื่อภาควิชา..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มภาควิชา</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีข้อมูลภาควิชา"
        columns={[
          { key: "code", header: "รหัส", className: "w-24" },
          { key: "name", header: "ชื่อภาควิชา" },
          { key: "faculty", header: "คณะ", render: (r) => r.faculty.name },
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
      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขภาควิชา" : "เพิ่มภาควิชา"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="div-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="div-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="คณะ" required options={facultyOptions} placeholder="เลือกคณะ"
            error={errors.facultyId?.message} {...register("facultyId")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="รหัสภาควิชา" required placeholder="เช่น CPE" error={errors.code?.message} {...register("code")} />
            <Input label="ชื่อภาควิชา" required placeholder="เช่น ภาควิชาวิศวกรรมคอมพิวเตอร์" error={errors.name?.message} {...register("name")} />
          </div>
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบภาควิชา" description={`ต้องการลบภาควิชา "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Departments ──────────────────────────────────────────────────────────────

const deptSchema = z.object({
  code:      z.string().min(1, "กรุณากรอกรหัส"),
  name:      z.string().min(1, "กรุณากรอกชื่อ"),
  facultyId: z.string().min(1, "กรุณาเลือกคณะ"),
  divisionId: z.string().optional(),
});
type DeptForm = z.infer<typeof deptSchema>;

function DepartmentsSection() {
  const { data: faculties } = useFetch<Faculty[]>("/faculties");
  const [filterFaculty, setFilter] = useState("");
  const [filterFacultyForDiv, setFilterFacultyForDiv] = useState("");
  const url = filterFaculty ? `/departments?facultyId=${filterFaculty}` : "/departments";
  const { data, loading, error, refetch } = useFetch<Department[]>(url);
  const divUrl = filterFacultyForDiv ? `/divisions?facultyId=${filterFacultyForDiv}` : "/divisions";
  const { data: divisions } = useFetch<Division[]>(divUrl);
  const [modal, setModal]         = useState<{ open: boolean; item?: Department }>({ open: false });
  const [deleteTarget, setDelete] = useState<Department | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search, filterFaculty]);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<DeptForm>({
    resolver: zodResolver(deptSchema),
  });

  const watchedFacultyId = watch("facultyId");
  useEffect(() => { setFilterFacultyForDiv(watchedFacultyId ?? ""); }, [watchedFacultyId]);

  useEffect(() => {
    if (modal.open) reset(modal.item
      ? { code: modal.item.code, name: modal.item.name, facultyId: modal.item.faculty.id, divisionId: modal.item.division?.id ?? "" }
      : { code: "", name: "", facultyId: "", divisionId: "" });
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: DeptForm) {
    try {
      if (modal.item) {
        await api.put(`/departments/${modal.item.id}`, v);
      } else {
        await api.post("/departments", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มสาขาสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const facultyOptions = (faculties ?? []).map((f) => ({ value: f.id, label: f.name }));
  const divisionOptions = (divisions ?? []).map((d) => ({ value: d.id, label: d.name }));
  const filtered = (data ?? []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Select options={[{ value: "", label: "ทุกคณะ" }, ...facultyOptions]}
            value={filterFaculty} onChange={(e) => setFilter(e.target.value)} className="w-44" />
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัส หรือชื่อสาขา..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มสาขา</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีข้อมูลสาขา"
        columns={[
          { key: "code", header: "รหัส", className: "w-24" },
          { key: "name", header: "ชื่อสาขา" },
          { key: "division", header: "ภาควิชา", render: (r) => r.division?.name ?? "—" },
          { key: "faculty", header: "คณะ", render: (r) => r.faculty.name },
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
      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขสาขา" : "เพิ่มสาขา"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="dept-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="dept-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="คณะ" required options={facultyOptions} placeholder="เลือกคณะ"
            error={errors.facultyId?.message} {...register("facultyId")} />
          <Select label="ภาควิชา (ถ้ามี)" options={[{ value: "", label: "— ไม่ระบุ —" }, ...divisionOptions]}
            {...register("divisionId")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="รหัสสาขา" required placeholder="เช่น CS" error={errors.code?.message} {...register("code")} />
            <Input label="ชื่อสาขา" required error={errors.name?.message} {...register("name")} />
          </div>
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบสาขา" description={`ต้องการลบสาขา "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Year Levels ──────────────────────────────────────────────────────────────

const ylSchema = z.object({
  level: z.coerce.number().min(1).max(8),
  name:  z.string().min(1, "กรุณากรอกชื่อ"),
});
type YLForm = z.infer<typeof ylSchema>;

interface YearLevelData { id: string; level: number; name: string; }

function YearLevelsSection() {
  const { data, loading, error, refetch } = useFetch<YearLevelData[]>("/year-levels");
  const [modal, setModal]         = useState<{ open: boolean; item?: YearLevelData }>({ open: false });
  const [deleteTarget, setDelete] = useState<YearLevelData | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<YLForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ylSchema) as any,
  });

  useEffect(() => {
    if (modal.open) reset(modal.item ? { level: modal.item.level, name: modal.item.name } : { level: 1, name: "" });
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: YLForm) {
    try {
      if (modal.item) {
        await api.put(`/year-levels/${modal.item.id}`, v);
      } else {
        await api.post("/year-levels", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มชั้นปีสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/year-levels/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const filtered = (data ?? []).filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชั้นปี..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มชั้นปี</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีข้อมูลชั้นปี"
        columns={[
          { key: "level", header: "ชั้นปีที่", className: "w-24" },
          { key: "name", header: "ชื่อชั้นปี" },
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
      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขชั้นปี" : "เพิ่มชั้นปี"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="yl-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="yl-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="ชั้นปีที่" type="number" required min={1} max={8} error={errors.level?.message} {...register("level")} />
          <Input label="ชื่อชั้นปี" required placeholder="เช่น ชั้นปีที่ 1" error={errors.name?.message} {...register("name")} />
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบชั้นปี" description={`ต้องการลบ "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "years",       label: "ปีการศึกษา" },
  { key: "semesters",   label: "ภาคการศึกษา" },
  { key: "faculties",   label: "คณะ" },
  { key: "divisions",   label: "ภาควิชา" },
  { key: "departments", label: "สาขา" },
  { key: "yearLevels",  label: "ชั้นปี" },
];

export default function AcademicPage() {
  const [tab, setTab] = useState("years");

  return (
    <div>
      <PageHeader title="จัดการวิชาการ" subtitle="ปีการศึกษา ภาคเรียน คณะ ภาควิชา สาขา และชั้นปี" icon={<GraduationCap size={20} />} />
      <Card>
        <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-5 -mx-5 -mt-5 px-5" />
        {tab === "years"       && <AcademicYearsSection />}
        {tab === "semesters"   && <SemestersSection />}
        {tab === "faculties"   && <FacultiesSection />}
        {tab === "divisions"   && <DivisionsSection />}
        {tab === "departments" && <DepartmentsSection />}
        {tab === "yearLevels"  && <YearLevelsSection />}
      </Card>
    </div>
  );
}
