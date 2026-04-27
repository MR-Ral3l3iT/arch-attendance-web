"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PageHeader, Button, Card, Tabs, Table, Modal, ConfirmModal, Input, Select, Alert, Pagination,
} from "@/components/ui";
import { useFetch, parseApiError } from "@/hooks/useFetch";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { Building, Room } from "@/types";

const LIMIT = 20;

// ─── Buildings ────────────────────────────────────────────────────────────────

const buildingSchema = z.object({
  code:      z.string().min(1, "กรุณากรอกรหัส"),
  name:      z.string().min(1, "กรุณากรอกชื่อ"),
  latitude:  z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  gpsRadius: z.coerce.number().min(10, "รัศมีต้องอย่างน้อย 10 เมตร").optional(),
});
type BuildingForm = z.infer<typeof buildingSchema>;

interface BuildingData extends Building {
  latitude?: number;
  longitude?: number;
  gpsRadius?: number;
}

function BuildingsSection() {
  const { data, loading, error, refetch } = useFetch<BuildingData[]>("/buildings");
  const [modal, setModal]         = useState<{ open: boolean; item?: BuildingData }>({ open: false });
  const [deleteTarget, setDelete] = useState<BuildingData | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BuildingForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(buildingSchema) as any,
  });

  useEffect(() => {
    if (modal.open) {
      reset(modal.item
        ? { code: modal.item.code, name: modal.item.name,
            latitude: modal.item.latitude, longitude: modal.item.longitude, gpsRadius: modal.item.gpsRadius }
        : { code: "", name: "", gpsRadius: 100 });
    }
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: BuildingForm) {
    try {
      if (modal.item) {
        await api.put(`/buildings/${modal.item.id}`, v);
      } else {
        await api.post("/buildings", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มอาคารสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/buildings/${deleteTarget.id}`);
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัส หรือชื่ออาคาร..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มอาคาร</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีข้อมูลอาคาร"
        columns={[
          { key: "code", header: "รหัส", className: "w-24" },
          { key: "name", header: "ชื่ออาคาร" },
          { key: "gps", header: "พิกัด GPS", render: (r) =>
            r.latitude ? `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)} (r=${r.gpsRadius}m)` : "—"
          },
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
        title={modal.item ? "แก้ไขอาคาร" : "เพิ่มอาคาร"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="bld-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="bld-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="รหัสอาคาร" required placeholder="เช่น B01" error={errors.code?.message} {...register("code")} />
            <Input label="ชื่ออาคาร" required error={errors.name?.message} {...register("name")} />
          </div>
          <p className="text-xs font-medium text-gray-500 -mb-2">พิกัด GPS สำหรับการตรวจสอบตำแหน่ง</p>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Latitude" type="number" step="any" placeholder="13.7563" error={errors.latitude?.message} {...register("latitude")} />
            <Input label="Longitude" type="number" step="any" placeholder="100.5018" error={errors.longitude?.message} {...register("longitude")} />
            <Input label="รัศมี (เมตร)" type="number" placeholder="100" error={errors.gpsRadius?.message} {...register("gpsRadius")} />
          </div>
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบอาคาร" description={`ต้องการลบอาคาร "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

const roomSchema = z.object({
  code:       z.string().min(1, "กรุณากรอกรหัส"),
  name:       z.string().min(1, "กรุณากรอกชื่อ"),
  buildingId: z.string().min(1, "กรุณาเลือกอาคาร"),
  capacity:   z.coerce.number().optional(),
});
type RoomForm = z.infer<typeof roomSchema>;

function RoomsSection() {
  const { data: buildings } = useFetch<Building[]>("/buildings");
  const [filterBuilding, setFilter] = useState("");
  const url = filterBuilding ? `/rooms?buildingId=${filterBuilding}` : "/rooms";
  const { data, loading, error, refetch } = useFetch<Room[]>(url);
  const [modal, setModal]         = useState<{ open: boolean; item?: Room }>({ open: false });
  const [deleteTarget, setDelete] = useState<Room | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  useEffect(() => { setPage(1); }, [search, filterBuilding]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoomForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(roomSchema) as any,
  });

  useEffect(() => {
    if (modal.open) {
      reset(modal.item
        ? { code: modal.item.code, name: modal.item.name, buildingId: modal.item.building.id, capacity: modal.item.capacity }
        : { code: "", name: "", buildingId: "", capacity: undefined });
    }
  }, [modal.open, modal.item, reset]);

  async function onSubmit(v: RoomForm) {
    try {
      if (modal.item) {
        await api.put(`/rooms/${modal.item.id}`, v);
      } else {
        await api.post("/rooms", v);
      }
      toast.success(modal.item ? "อัปเดตสำเร็จ" : "เพิ่มห้องสำเร็จ");
      setModal({ open: false }); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/rooms/${deleteTarget.id}`);
      toast.success("ลบสำเร็จ"); setDelete(null); refetch();
    } catch (e) { toast.error(parseApiError(e)); }
    finally { setDeleting(false); }
  }

  const buildingOptions = (buildings ?? []).map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` }));
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
          <Select options={[{ value: "", label: "ทุกอาคาร" }, ...buildingOptions]}
            value={filterBuilding} onChange={(e) => setFilter(e.target.value)} className="w-48" />
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัส หรือชื่อห้อง..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setModal({ open: true })}>เพิ่มห้อง</Button>
      </div>
      <Table data={paged} keyField="id" loading={loading} emptyMessage="ยังไม่มีข้อมูลห้องเรียน"
        columns={[
          { key: "code", header: "รหัสห้อง", className: "w-28" },
          { key: "name", header: "ชื่อห้อง" },
          { key: "building", header: "อาคาร", render: (r) => `${r.building.code}` },
          { key: "capacity", header: "ความจุ", render: (r) => r.capacity ? `${r.capacity} คน` : "—" },
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
        title={modal.item ? "แก้ไขห้อง" : "เพิ่มห้องเรียน"}
        footer={<><Button variant="secondary" onClick={() => setModal({ open: false })}>ยกเลิก</Button>
          <Button form="room-form" type="submit" loading={isSubmitting}>บันทึก</Button></>}
      >
        <form id="room-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="อาคาร" required options={buildingOptions} placeholder="เลือกอาคาร"
            error={errors.buildingId?.message} {...register("buildingId")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="รหัสห้อง" required placeholder="เช่น B01-101" error={errors.code?.message} {...register("code")} />
            <Input label="ชื่อห้อง" required error={errors.name?.message} {...register("name")} />
          </div>
          <Input label="ความจุ (คน)" type="number" error={errors.capacity?.message} {...register("capacity")} />
        </form>
      </Modal>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={onDelete}
        title="ลบห้อง" description={`ต้องการลบห้อง "${deleteTarget?.name}" ใช่ไหม?`}
        confirmVariant="danger" confirmLabel="ลบ" loading={deleting} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuildingsPage() {
  const [tab, setTab] = useState("buildings");
  return (
    <div>
      <PageHeader title="จัดการอาคาร / ห้องเรียน" icon={<Building2 size={20} />} />
      <Card>
        <Tabs tabs={[{ key: "buildings", label: "อาคาร" }, { key: "rooms", label: "ห้องเรียน" }]}
          active={tab} onChange={setTab} className="mb-5 -mx-5 -mt-5 px-5" />
        {tab === "buildings" && <BuildingsSection />}
        {tab === "rooms"     && <RoomsSection />}
      </Card>
    </div>
  );
}
