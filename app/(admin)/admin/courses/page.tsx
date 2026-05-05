"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Users, Search, BookOpen, X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PageHeader, Button, Card, Tabs, Table, Modal, ConfirmModal,
  Input, Select, Alert, Pagination, Badge,
} from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { Course, Section, Department, Semester, Student, Enrollment, PaginatedResponse } from "@/types";

const LIMIT = 20;

interface YearLevelData { id: string; level: number; name: string; }

// ─── Courses ─────────────────────────────────────────────────────────────────

const courseSchema = z.object({
  code:         z.string().min(1, "กรุณากรอกรหัสวิชา"),
  name:         z.string().min(1, "กรุณากรอกชื่อวิชา"),
  credits:      z.coerce.number().min(1).max(9),
  departmentId: z.string().min(1, "กรุณาเลือกสาขา"),
});
type CourseForm = z.infer<typeof courseSchema>;

function CoursesSection({ onSelectCourse }: { onSelectCourse: (c: Course) => void }) {
  const { data, loading, error, refetch } = useFetch<Course[]>("/courses");
  const { data: departments } = useFetch<Department[]>("/departments");
  const [modal, setModal]         = useState<{ open: boolean; item?: Course }>({ open: false });
  const [deleteTarget, setDelete] = useState<Course | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [filterDept, setFilterDept] = useState("");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  useEffect(() => { setPage(1); }, [search, filterDept]);

  const deptOptions = (departments ?? []).map((d) => ({ value: d.id, label: d.name }));

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CourseForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(courseSchema) as any,
  });

  useEffect(() => {
    if (modal.open) reset(modal.item
      ? { code: modal.item.code, name: modal.item.name, credits: modal.item.credits, departmentId: modal.item.department.id }
      : { code: "", name: "", credits: 3, departmentId: "" });
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: CourseForm) {
    try {
      if (modal.item) {
        await api.patch(`/courses/${modal.item.id}`, v);
      } else {
        await api.post("/courses", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มรายวิชาสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/courses/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const filtered = (data ?? []).filter((r) => {
    if (filterDept && r.department.id !== filterDept) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Select options={[{ value: "", label: "ทุกสาขา" }, ...deptOptions]}
            value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="w-44" />
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัส หรือชื่อวิชา..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มรายวิชา</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีรายวิชา"
        columns={[
          { key: "code", header: "รหัสวิชา", className: "w-28" },
          { key: "name", header: "ชื่อวิชา" },
          { key: "credits", header: "หน่วยกิต", className: "w-20", render: (r) => `${r.credits} หน่วยกิต` },
          { key: "dept", header: "สาขา", render: (r) => r.department.name },
          { key: "actions", header: "", render: (r) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" title="จัดการกลุ่มเรียน" onClick={() => onSelectCourse(r)}>กลุ่มเรียน</Button>
              <Button variant="ghost" size="sm" onClick={() => setModal({ open: true, item: r })}><Pencil size={14} /></Button>
              <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => setDelete(r)}><Trash2 size={14} /></Button>
            </div>
          )},
        ]}
      />
      <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={LIMIT} onPageChange={setPage} className="mt-4" />

      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขรายวิชา" : "เพิ่มรายวิชา"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="course-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="course-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input label="รหัสวิชา" required error={errors.code?.message} {...register("code")} />
            <div className="col-span-2">
              <Input label="ชื่อวิชา" required error={errors.name?.message} {...register("name")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="หน่วยกิต" type="number" required min={1} max={9} error={errors.credits?.message} {...register("credits")} />
            <Select label="สาขา" required options={deptOptions} placeholder="เลือกสาขา"
              error={errors.departmentId?.message} {...register("departmentId")} />
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบรายวิชา" description={`ต้องการลบ ${deleteTarget?.code} — ${deleteTarget?.name} ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Student Picker Modal ─────────────────────────────────────────────────────

interface StudentPickerProps {
  section: Section | null;
  course: Course;
  onClose: () => void;
  onSaved: () => void;
}

function StudentPickerModal({ section, course, onClose, onSaved }: StudentPickerProps) {
  const [students, setStudents]           = useState<Student[]>([]);
  const [enrollments, setEnrollments]     = useState<Enrollment[]>([]);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [search, setSearch]               = useState("");
  // studentId → enrollmentId (if enrolled)
  const [enrolledMap, setEnrolledMap]     = useState<Map<string, string>>(new Map());
  // current selection state
  const [selected, setSelected]           = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!section) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "500" });
      if (course.department?.id) params.set("departmentId", course.department.id);
      if (section.yearLevelId) params.set("yearLevelId", section.yearLevelId);

      const [stuRes, enrollRes] = await Promise.all([
        api.get<PaginatedResponse<Student>>(`/students?${params}`),
        api.get<Enrollment[]>(`/enrollments?sectionId=${section.id}`),
      ]);

      const stuList = stuRes.data.data;
      const enrollList = enrollRes.data;

      const map = new Map<string, string>();
      for (const e of enrollList) map.set(e.studentId, e.id);

      setStudents(stuList);
      setEnrollments(enrollList);
      setEnrolledMap(map);
      setSelected(new Set(map.keys()));
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setLoading(false); }
  }, [section, course]);

  useEffect(() => {
    if (section) { setSearch(""); loadData(); }
  }, [section, loadData]);

  async function handleSave() {
    if (!section) return;
    setSaving(true);
    try {
      const initialSet = new Set(enrolledMap.keys());
      const toAdd    = [...selected].filter((id) => !initialSet.has(id));
      const toRemove = [...initialSet].filter((id) => !selected.has(id));

      await Promise.all([
        ...toAdd.map((studentId) => api.post("/enrollments", { studentId, sectionId: section.id })),
        ...toRemove.map((studentId) => api.delete(`/enrollments/${enrolledMap.get(studentId)}`)),
      ]);

      const added   = toAdd.length;
      const removed = toRemove.length;
      if (added || removed) {
        toast.success(`เพิ่ม ${added} | ลบ ${removed} คน`);
      } else {
        toast.success("ไม่มีการเปลี่ยนแปลง");
      }
      onSaved(); onClose();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setSaving(false); }
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(visible.map((s) => s.id)) : new Set());
  }

  const visible = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.code.toLowerCase().includes(q)
      || s.firstName.toLowerCase().includes(q)
      || s.lastName.toLowerCase().includes(q);
  });

  const allVisibleSelected = visible.length > 0 && visible.every((s) => selected.has(s.id));
  const someVisibleSelected = visible.some((s) => selected.has(s.id));

  return (
    <Modal
      open={!!section}
      onClose={onClose}
      size="lg"
      title={`จัดการนักศึกษา — ${section?.name ?? ""}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-gray-500">
            เลือกแล้ว {selected.size} คน
            {section?.yearLevel && (
              <span className="ml-2 text-xs text-gray-400">
                (กรองตาม {section.yearLevel.name})
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>ยกเลิก</Button>
            <Button onClick={handleSave} loading={saving}>บันทึก</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Filter info */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            สาขา: {course.department?.name ?? "ทุกสาขา"}
          </span>
          {section?.yearLevel && (
            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
              {section.yearLevel.name}
            </span>
          )}
          {!section?.yearLevelId && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500">
              ทุกชั้นปี
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-10 text-sm text-gray-400">กำลังโหลด...</div>
        ) : visible.length === 0 ? (
          <div className="flex justify-center py-10 text-sm text-gray-400">
            {students.length === 0 ? "ไม่พบนักศึกษาในสาขา/ชั้นปีนี้" : "ไม่พบนักศึกษาที่ค้นหา"}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Select all header */}
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary accent-primary cursor-pointer"
                checked={allVisibleSelected}
                ref={(el) => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span className="text-xs font-medium text-gray-600">
                เลือกทั้งหมด ({visible.length} คน)
              </span>
            </div>

            {/* Student rows */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {visible.map((s) => {
                const isSelected = selected.has(s.id);
                const wasEnrolled = enrolledMap.has(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary accent-primary cursor-pointer shrink-0"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(s.id); else next.delete(s.id);
                        setSelected(next);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{s.code}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {s.yearLevel && (
                        <span className="text-xs text-gray-400">{s.yearLevel.name}</span>
                      )}
                      {wasEnrolled && !isSelected && (
                        <Badge variant="danger" className="text-[10px]">จะลบออก</Badge>
                      )}
                      {!wasEnrolled && isSelected && (
                        <Badge variant="success" className="text-[10px]">จะเพิ่ม</Badge>
                      )}
                      {wasEnrolled && isSelected && (
                        <Check size={14} className="text-success" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {enrollments.length > 0 && (
          <p className="text-xs text-gray-400">
            ปัจจุบันมีนักศึกษาลงทะเบียนอยู่ {enrollments.length} คน
          </p>
        )}
      </div>
    </Modal>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────

const sectionSchema = z.object({
  name:        z.string().min(1, "กรุณากรอกชื่อกลุ่ม"),
  courseId:    z.string().min(1),
  semesterId:  z.string().min(1, "กรุณาเลือกภาคการศึกษา"),
  yearLevelId: z.string().optional(),
  maxStudents: z.coerce.number().optional(),
});
type SectionForm = z.infer<typeof sectionSchema>;

function SectionsSection({ selectedCourse, onBack }: { selectedCourse: Course; onBack: () => void }) {
  const url = `/sections?courseId=${selectedCourse.id}`;
  const { data, loading, error, refetch } = useFetch<Section[]>(url);
  const { data: semesters }  = useFetch<Semester[]>("/semesters");
  const { data: yearLevels } = useFetch<YearLevelData[]>("/year-levels");

  const [modal, setModal]           = useState<{ open: boolean; item?: Section }>({ open: false });
  const [deleteTarget, setDelete]   = useState<Section | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [enrollSection, setEnroll]  = useState<Section | null>(null);
  const [filterSem, setFilterSem]   = useState("");
  const [page, setPage]             = useState(1);
  useEffect(() => { setPage(1); }, [filterSem]);

  const semOptions = (semesters ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.academicYear.name})` }));
  const ylOptions  = (yearLevels ?? []).map((y) => ({ value: y.id, label: y.name }));

  const filteredSections = (data ?? []).filter((s) => !filterSem || s.semester?.id === filterSem);
  const secTotalPages = Math.max(1, Math.ceil(filteredSections.length / LIMIT));
  const secPaged = filteredSections.slice((page - 1) * LIMIT, page * LIMIT);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SectionForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sectionSchema) as any,
    defaultValues: { courseId: selectedCourse.id },
  });

  useEffect(() => {
    if (modal.open) reset(modal.item
      ? { name: modal.item.name, courseId: selectedCourse.id, semesterId: modal.item.semester.id,
          yearLevelId: modal.item.yearLevelId ?? "", maxStudents: modal.item.maxStudents }
      : { name: "", courseId: selectedCourse.id, semesterId: "", yearLevelId: "", maxStudents: undefined });
  }, [modal.open, modal.item, reset, selectedCourse.id]);

  async function onSubmit(v: SectionForm) {
    const payload = { ...v, yearLevelId: v.yearLevelId || undefined };
    try {
      if (modal.item) {
        await api.patch(`/sections/${modal.item.id}`, payload);
      } else {
        await api.post("/sections", payload);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มกลุ่มเรียนสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/sections/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Button variant="ghost" size="sm" onClick={onBack}>← กลับ</Button>
        <p className="text-sm font-medium text-gray-700">{selectedCourse.code} — {selectedCourse.name}</p>
        <Select options={[{ value: "", label: "ทุกภาคการศึกษา" }, ...semOptions]}
          value={filterSem} onChange={(e) => setFilterSem(e.target.value)} className="w-52 ml-auto" />
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มกลุ่มเรียน</Button>
      </div>

      <Table data={secPaged} keyField="id" loading={loading} emptyMessage="ยังไม่มีกลุ่มเรียน"
        columns={[
          { key: "name", header: "กลุ่มเรียน" },
          { key: "semester", header: "ภาคการศึกษา",
            render: (r) => r.semester?.academicYear
              ? `${r.semester.name} (${r.semester.academicYear.name})`
              : (r.semester?.name ?? "—") },
          { key: "yearLevel", header: "ชั้นปี",
            render: (r) => r.yearLevel
              ? <Badge variant="info">{r.yearLevel.name}</Badge>
              : <span className="text-gray-400 text-xs">ทุกชั้นปี</span> },
          { key: "max", header: "จำนวนสูงสุด", render: (r) => r.maxStudents ? `${r.maxStudents} คน` : "ไม่จำกัด" },
          { key: "actions", header: "", render: (r) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" title="จัดการนักศึกษา" onClick={() => setEnroll(r)}>
                <Users size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setModal({ open: true, item: r })}><Pencil size={14} /></Button>
              <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={() => setDelete(r)}><Trash2 size={14} /></Button>
            </div>
          )},
        ]}
      />
      <Pagination page={page} totalPages={secTotalPages} total={filteredSections.length} limit={LIMIT}
        onPageChange={setPage} className="mt-4" />

      {/* Section form modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? "แก้ไขกลุ่มเรียน" : "เพิ่มกลุ่มเรียน"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="section-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="section-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="ชื่อกลุ่มเรียน" required placeholder="เช่น กลุ่ม 1" error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="ภาคการศึกษา" required options={semOptions} placeholder="เลือกภาค"
              error={errors.semesterId?.message} {...register("semesterId")} />
            <Select label="ชั้นปี (ใช้กรองนักศึกษา)" options={[{ value: "", label: "ทุกชั้นปี" }, ...ylOptions]}
              {...register("yearLevelId")} />
          </div>
          <Input label="จำนวนนักศึกษาสูงสุด" type="number" placeholder="ไม่จำกัด" {...register("maxStudents")} />
        </form>
      </Modal>

      {/* Student picker */}
      <StudentPickerModal
        section={enrollSection}
        course={selectedCourse}
        onClose={() => setEnroll(null)}
        onSaved={refetch}
      />

      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบกลุ่มเรียน" description={`ต้องการลบกลุ่ม "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [tab, setTab]                 = useState("courses");
  const [selectedCourse, setSelected] = useState<Course | null>(null);

  function handleSelectCourse(c: Course) { setSelected(c); setTab("sections"); }
  function handleBack() { setSelected(null); setTab("courses"); }

  return (
    <div>
      <PageHeader title="จัดการรายวิชา / กลุ่มเรียน" icon={<BookOpen size={20} />} />
      <Card>
        <Tabs tabs={[{ key: "courses", label: "รายวิชา" }, { key: "sections", label: "กลุ่มเรียน" }]}
          active={tab} onChange={(k) => { setTab(k); if (k === "courses") setSelected(null); }}
          className="mb-5 -mx-5 -mt-5 px-5" />
        {tab === "courses" && <CoursesSection onSelectCourse={handleSelectCourse} />}
        {tab === "sections" && selectedCourse
          ? <SectionsSection selectedCourse={selectedCourse} onBack={handleBack} />
          : tab === "sections" && (
            <Alert variant="info">กรุณาเลือกรายวิชาจากแท็บ &quot;รายวิชา&quot; ก่อน</Alert>
          )
        }
      </Card>
    </div>
  );
}
