# Task List — ระบบเช็คชื่อนักศึกษา

> **Legend:** `[ ]` = ยังไม่เริ่ม `[x]` = เสร็จแล้ว `[-]` = กำลังทำ / รอดำเนินการ

## สถานะภาพรวม

| Phase | สถานะ | หมายเหตุ |
|---|---|---|
| Phase 0 — Project Setup | ✅ เสร็จ | |
| Phase 1 — Backend (NestJS) | ✅ เสร็จ | Notification Firebase รอ credentials |
| Phase 2 — Frontend Web (Next.js) | ✅ เสร็จ | Build ผ่าน, TypeScript + ESLint clean |
| Phase 3 — Mobile App (Flutter) | 🔄 กำลังพัฒนา | ฟีเจอร์หลักใช้งานได้, Push Notification กำลังเชื่อม |
| Phase 4 — Testing & QA | ⏳ ยังไม่เริ่ม | |
| Phase 5 — Deployment | ⏳ ยังไม่เริ่ม | |

*อัปเดตล่าสุด: 2026-04-27 (session 4)*

---

## Phase 0 — Project Setup ✅

### Repository & Environment
- [x] สร้าง Repo `attendance-api` (NestJS)
- [x] สร้าง Repo `attendance-web` (Next.js)
- [x] สร้าง Repo `attendance-app` (Flutter)
- [x] ตั้งค่า `.env` และ `.env.example` ทั้ง 3 Repo
- [x] ตั้งค่า `ESLint` + `Prettier` (Web + API)
- [x] ตั้งค่า `analysis_options.yaml` (Flutter)
- [x] สร้าง `docker-compose.yml` สำหรับ PostgreSQL local dev

---

## Phase 1 — Backend (NestJS) ✅

### 1.1 Core Setup
- [x] ติดตั้ง NestJS + dependencies พื้นฐาน
- [x] ตั้งค่า Prisma + เชื่อมต่อ PostgreSQL
- [x] ตั้งค่า Swagger (`/api/docs`) — ภาษาไทยครบ 16 tags
- [x] ตั้งค่า Global Validation Pipe (`class-validator`)
- [x] ตั้งค่า Global Exception Filter
- [x] ตั้งค่า CORS

### 1.2 Prisma Schema
- [x] `AcademicYear` — ปีการศึกษา
- [x] `Semester` — ภาคการศึกษา (มี `sections Section[]`)
- [x] `Faculty` — คณะ (มี `divisions Division[]`)
- [x] `Division` — ภาควิชา (Faculty → Division → Department)
- [x] `Department` — สาขา (มี optional `divisionId`)
- [x] `YearLevel` — ชั้นปี
- [x] `Building` — อาคาร (พร้อม lat/lng/radius)
- [x] `Room` — ห้องเรียน
- [x] `User` — ผู้ใช้งานทุก role
- [x] `Teacher` — ข้อมูลอาจารย์
- [x] `Student` — ข้อมูลนักศึกษา + deviceId
- [x] `Course` — รายวิชา
- [x] `Section` — กลุ่มเรียน (มี `semesterId` required, `maxStudents?`, `@@unique([courseId, semesterId, name])`)
- [x] `Schedule` — ตารางเรียน (วัน/เวลา/ห้อง/อาจารย์)
- [x] `Enrollment` — ผูก นศ กับ Section
- [x] `AttendanceRecord` — บันทึกเช็คชื่อ (รูป/เวลา/พิกัด/device/status)
- [x] `AttendanceSettings` — เงื่อนไขเช็คชื่อรายวิชา (override)
- [x] `LeaveRequest` — คำขอลา
- [x] `AuditLog` — บันทึกการแก้ไขทั้งหมด
- [x] `Notification` — บันทึก notification
- [x] `SystemSettings` — ค่า default ระดับระบบ (key-value store: 5 keys)
- [x] รัน `prisma db push --force-reset` + `prisma db seed` ✅ (2026-04-25)
- [x] เขียน `prisma/seed.ts` ข้อมูลตัวอย่าง (อัปเดต unique key `courseId_semesterId_name`)

### 1.3 Auth Module
- [x] `POST /auth/login` — รับ username/password คืน JWT
- [x] JWT payload: `userId`, `role`, `teacherId`, `studentId`
- [x] `JwtAuthGuard` — ป้องกัน route
- [x] `RolesGuard` + `@Roles()` decorator
- [x] `@CurrentUser()` decorator
- [x] ตรวจ deviceId สำหรับ Student login + auto-bind ครั้งแรก
- [x] `POST /auth/refresh` — refresh token
- [x] `POST /auth/logout`

### 1.4 Academic Module
- [x] `CRUD /academic-years`
- [x] `CRUD /semesters`
- [x] `CRUD /faculties`
- [x] `CRUD /divisions` — ภาควิชา (Faculty → Division → Department hierarchy)
- [x] `CRUD /departments` (มี optional `divisionId`)
- [x] `CRUD /year-levels`

### 1.5 Building Module
- [x] `CRUD /buildings` (พร้อม lat/lng/radius)
- [x] `CRUD /rooms`

### 1.6 User Module
- [x] `CRUD /teachers` (+ Bulk Import JSON/CSV)
- [x] `CRUD /students` (+ Bulk Import JSON/CSV)
- [x] `PATCH /students/:id/device/reset` — Admin reset device binding
- [x] Bulk Import: validate + summary error รายแถว

### 1.7 Course & Schedule Module
- [x] `CRUD /courses`
- [x] `CRUD /sections`
- [x] `CRUD /schedules`
- [x] `POST /enrollments` — ผูก นศ เข้า Section
- [x] `POST /enrollments/bulk` — ผูก bulk

### 1.8 Attendance Settings Module
- [x] `GET /attendance-settings/:scheduleId` — ดูเงื่อนไข (fallback default อัตโนมัติ)
- [x] `PUT /attendance-settings/:scheduleId` — Teacher override
- [x] fallback ไป Default ถ้าไม่มี override

### 1.9 Attendance Module
- [x] `POST /attendance/check-in` — เช็คชื่อ (Student)
  - [x] ตรวจสิทธิ์เรียน (Enrollment)
  - [x] ตรวจช่วงเวลา (openBefore / closeAfter)
  - [x] ตรวจขอบเขตอาคาร (Haversine formula)
  - [x] ตรวจ device binding
  - [x] ตรวจเช็คซ้ำ
  - [x] รับรูป Selfie (multipart/form-data, max 5MB)
  - [x] บันทึก status: `ON_TIME` / `LATE`
  - [x] Flag รายการผิดปกติอัตโนมัติ (นอกพื้นที่, ไม่มีรูป)
- [x] `GET /attendance/schedule/:scheduleId` — Teacher ดูรายคาบ
- [x] `GET /attendance/student/:studentId` — ประวัติ นศ
- [x] `PATCH /attendance/:id/status` — Teacher แก้ไขสถานะ (+ AuditLog อัตโนมัติ)
- [x] `GET /attendance/flags` — ดูรายการ flag ผิดปกติ

### 1.10 Leave Request Module
- [x] `POST /leave-requests` — Student ยื่นคำขอ (+ แนบไฟล์หลักฐาน)
- [x] `GET /leave-requests/pending` — Teacher ดูรายการรอ
- [x] `GET /leave-requests/my` — Student ดูของตัวเอง
- [x] `PATCH /leave-requests/:id/approve` — Teacher อนุมัติ
- [x] `PATCH /leave-requests/:id/reject` — Teacher ปฏิเสธ
- [x] เมื่ออนุมัติ → อัพเดท AttendanceRecord + AuditLog (transaction)

### 1.11 Notification Module
- [ ] ตั้งค่า Firebase Admin SDK (โครงสร้างพร้อม รอใส่ credentials)
- [ ] `POST /notifications/send` — ส่ง push notification จริง
- [x] Cron Job: แจ้งเตือนก่อนคาบ 15 นาที (ทุก 5 นาที)
- [ ] Cron Job: แจ้งเตือน นศ ที่ยังไม่เช็ค X นาทีหลังคาบเริ่ม
- [ ] Trigger: แจ้ง Teacher เมื่อมีคำขอลาใหม่
- [ ] Trigger: แจ้ง Student เมื่อ Teacher อนุมัติ/ปฏิเสธ

### 1.12 Report Module
- [x] `GET /reports/schedule/:scheduleId` — สรุปรายวิชา
- [x] `GET /reports/student/:studentId` — สรุปรายนักศึกษา + เปอร์เซ็นต์
- [x] `GET /reports/export` — Export ข้อมูล (JSON → ใช้ต่อกับ xlsx ฝั่ง Frontend)
- [x] Filter: ตาม faculty / department / course / semester

### 1.13 Audit Log Module
- [x] บันทึก AuditLog ทุกครั้งที่มีการแก้ไขสถานะ (transaction)
- [x] `GET /audit-logs` — Admin/Teacher ดู log
- [x] `GET /audit-logs/attendance/:id` — ดู log รายการ

### 1.14 System Settings Module ✅ *(เพิ่ม 2026-04-25)*
- [x] `GET /system-settings` — ดูค่า default ระบบ (ทุก role)
- [x] `PUT /system-settings` — อัปเดต (Admin เท่านั้น)
- [x] Key-value store: `CHECK_IN_OPEN_BEFORE_MINUTES`, `CHECK_IN_ABSENT_AFTER_MINUTES`, `CHECK_IN_LATE_AFTER_MINUTES`, `GPS_RADIUS_METERS`, `REQUIRE_SELFIE`
- [x] Fallback DEFAULTS ถ้า key ไม่มีใน DB

---

## Phase 2 — Frontend Web (Next.js) ✅

### 2.1 Core Setup
- [x] ติดตั้ง Next.js 15.5.15 (ล็อค version แล้ว) + TailwindCSS + Lucide Icons
- [x] Design System: `tailwind.config.ts` สี primary `#c80b11`, font Prompt, attendance colors
- [x] `app/layout.tsx` — Google Font Prompt (Thai subset), lang="th"
- [x] `app/globals.css` — CSS variables, scrollbar utilities
- [x] `lib/utils.ts` — `cn()` (clsx + tailwind-merge), formatDate/Time, status labels
- [x] `lib/api.ts` — Axios instance + JWT interceptor + auto refresh
- [x] `types/index.ts` — TypeScript types ครบทุก model (ตรงกับ Prisma schema)
- [x] Shared UI Components (`components/ui/`):
  - [x] Button (primary/secondary/ghost/danger/outline × sm/md/lg + loading)
  - [x] Input (label, error, hint, leftIcon, rightIcon)
  - [x] Select (label, error, placeholder, options)
  - [x] Textarea (label, error, hint)
  - [x] Badge (6 variants) + AttendanceBadge + LeaveStatusBadge + RoleBadge
  - [x] Card + CardHeader + CardTitle + CardFooter
  - [x] Modal (Esc/overlay close, scroll body) + ConfirmModal
  - [x] Table (generic, loading, empty state)
  - [x] Spinner + PageLoader + FullPageLoader
  - [x] Alert (success/warning/danger/info + dismissable)
  - [x] PageHeader (title, subtitle, breadcrumb, actions, **icon** — เพิ่ม 2026-04-25)
  - [x] StatCard (icon, trend, accent border)
  - [x] Avatar (image → initials → icon fallback)
  - [x] Pagination (smart page list, Thai label)
  - [x] Toast + ToastContainer (success/error/warning/info, auto-dismiss, portal)
- [x] `hooks/useToast.ts` — `toast.success/error/warning/info()` + `useApiError()` hook
- [x] `store/toast.store.ts` — zustand store, สามารถเรียกได้ทั้งใน/นอก React component
- [x] `store/auth.store.ts` — zustand + persist (localStorage + cookie sync สำหรับ middleware)
- [x] `components/Providers.tsx` — Client wrapper (ToastContainer)
- [x] `middleware.ts` — redirect ตาม role, guard `/admin` / `/teacher`, redirect `/login` พร้อม `?redirect=`
- [x] `components/layout/Sidebar.tsx` — generic sidebar (sections, active state, badge, logout)
- [x] `components/layout/Header.tsx` — top bar (Bell, user avatar, role badge)
- [x] สร้าง Layout แยก:
  - [x] `app/(auth)/layout.tsx` — centered login layout
  - [x] `app/(admin)/layout.tsx` — admin sidebar + header (10 nav items, 5 groups)
  - [x] `app/(teacher)/layout.tsx` — teacher sidebar + header (5 nav items, 3 groups)

### 2.2 Auth
- [x] หน้า Login (`/login`) — react-hook-form + zod, show/hide password, server error alert
- [x] Redirect หลัง login ตาม role (`ADMIN→/admin`, `TEACHER→/teacher`)
- [x] Logout (ล้าง token + cookie + redirect `/login` + toast)

### 2.3 Admin — Academic Management ✅
- [x] หน้าจัดการปีการศึกษา / ภาคการศึกษา
- [x] หน้าจัดการคณะ / **ภาควิชา** / สาขา / ชั้นปี (เพิ่ม Division tab 2026-04-25)
  - [x] สาขา (Department) มี Dropdown ภาควิชา (filter ตามคณะที่เลือก)
- [x] หน้าจัดการอาคาร / ห้องเรียน (พร้อม GPS input)
- [x] Search + Pagination (limit=20) ทุก section ใน `/admin/academic`
- [x] Search + Pagination (limit=20) + filter อาคาร ใน `/admin/buildings`

### 2.4 Admin — User Management ✅
- [x] หน้าจัดการนักศึกษา (list + เพิ่ม/แก้/ลบ) + Search + Pagination
- [x] Import นักศึกษา CSV / Excel (.xlsx) — แสดงผล success/error รายแถว
- [x] ดาวน์โหลด Template Excel สำหรับ Import นักศึกษา — พร้อม Dropdown สาขา + ชั้นปี (ดึงจาก API จริง)
- [x] หน้าจัดการอาจารย์ (list + เพิ่ม/แก้/ลบ) + Search + Pagination
- [x] Import อาจารย์ CSV
- [x] Reset Device Binding ของนักศึกษา

### 2.5 Admin — Course & Schedule ✅
- [x] หน้าจัดการรายวิชา + Search + filter สาขา + Pagination (limit=20)
- [x] หน้าจัดการกลุ่มเรียน / section + filter ภาคการศึกษา + Pagination (limit=20) + bugfix `semester?.academicYear?.name`
- [x] หน้าจัดการตารางเรียน + Search + filter ภาคการศึกษา + Pagination (limit=20)
- [-] หน้าผูก นศ เข้ากลุ่มเรียน (bulk) ← ยังไม่มี UI แยก (ใช้ผ่าน API โดยตรง)

### 2.6 Admin — Settings & Reports ✅
- [x] หน้าตั้งค่าเงื่อนไขเช็คชื่อ Default (`/admin/settings`) — เชื่อมกับ `/system-settings` API
- [x] หน้า Dashboard ภาพรวม (สถิติรวม) — icon `LayoutDashboard`
- [x] หน้ารายงาน + Export + Pagination (limit=20) ในตาราง summary

### 2.7 Teacher — Dashboard ✅
- [x] หน้า Dashboard อาจารย์ (รายวิชาที่สอน + ตารางสอน)

### 2.8 Teacher — Attendance ✅
- [x] หน้าเลือกวิชา → เลือกคาบ — icon `ClipboardCheck`
- [x] หน้ารายชื่อนักศึกษา + สถานะเช็คชื่อ + filter สถานะ + **Pagination (limit=20)** — icon `ClipboardList`
- [x] Modal ดูรูป Selfie + ตำแหน่ง
- [x] หน้าดูรายการ Flag ผิดปกติ + Search + Pagination (limit=20) — icon `AlertTriangle`
- [x] แก้ไขสถานะ (พร้อมกรอกเหตุผล)

### 2.9 Teacher — Leave Requests ✅
- [x] หน้ารายการคำขอลา + filter สถานะ (PENDING / APPROVED / REJECTED) + Pagination (server-side, limit=20) — icon `FileText`
- [x] อนุมัติ / ปฏิเสธ พร้อม confirm modal (ปุ่มแสดงเฉพาะรายการ PENDING)

### 2.10 Teacher — Settings & Reports ✅
- [x] หน้าปรับเงื่อนไขเช็คชื่อรายวิชา (override) — icon `Settings`
- [x] หน้ารายงานรายวิชา + Export + Pagination (limit=20) ในตาราง summary — icon `BarChart3`

### 2.11 UI/UX Improvements ✅ *(2026-04-25)*
- [x] `PageHeader` component รองรับ `icon?: React.ReactNode` — แสดงเป็น rounded box `bg-primary/10` ก่อน title
- [x] ทุกหน้าใส่ icon Lucide ตามประเภท (LayoutDashboard, GraduationCap, Building2, BookOpen, CalendarDays, Users, UserCheck, SlidersHorizontal, BarChart3, ClipboardCheck, ClipboardList, AlertTriangle, FileText, Settings)
- [x] Pagination limit = **20** ทุกหน้า (เดิมบางหน้าใช้ 10 หรือ 15)
- [x] เพิ่ม Pagination ในหน้าที่ยังไม่มี: `teacher/attendance/[scheduleId]`, `teacher/reports`, `admin/reports`

---

## Phase 3 — Mobile App (Flutter)

### 3.1 Core Setup
- [x] สร้างโครงสร้าง Flutter project (features/auth, dashboard, attendance, leave_request, history)
- [x] เขียน `pubspec.yaml` พร้อม dependencies ครบ
- [x] ตั้งค่า `analysis_options.yaml`
- [x] ตั้งค่า Dio instance + interceptor (attach JWT)
- [x] ตั้งค่า App Router / Navigation
- [x] ตั้งค่า Theme + Color scheme
- [x] ตั้งค่า Firebase Core + Firebase Messaging เบื้องต้น
- [x] iOS: วาง `GoogleService-Info.plist` และผูกเข้า Runner target/resources
- [x] iOS: เพิ่ม `Runner.entitlements` + `aps-environment`, เปิด `UIBackgroundModes > remote-notification`
- [x] เพิ่มโค้ดขอ permission + อ่าน APNs/FCM token + foreground/background handlers
- [ ] iOS: รอทดสอบ APNs token บนเครื่องจริง (Simulator ได้ `apnsToken=null` เป็นปกติ)
- [x] Android: เปลี่ยน package เป็น `com.korrakang.archd.attendance`
- [x] Android: วาง `google-services.json` + ผูก `com.google.gms.google-services` plugin
- [ ] Android: รอทดสอบบนเครื่องจริง/Emulator และ verify FCM token

### 3.2 Auth Feature
- [x] หน้า Login
- [x] บันทึก JWT token ใน SharedPreferences
- [x] ผูก deviceId อัตโนมัติเมื่อ login ครั้งแรก
- [x] Auto login ถ้ามี token อยู่
- [x] Logout + ล้าง token

### 3.3 Dashboard Feature
- [x] หน้า Dashboard — คาบเรียนวันนี้
- [x] แสดงคาบปัจจุบัน
- [x] แสดงสถานะแต่ละคาบ (เช็คแล้ว / ยังไม่เช็ค / ขาด)
- [x] BLoC: `DashboardBloc`
- [x] ปรับ Top Navbar เป็นชื่อผู้ใช้ และล็อคด้านบนทุก tab
- [x] ย้ายสถิติรายวิชาไปหน้าแรก (2 cards ต่อแถว)
- [x] เปลี่ยนเมนูล่างจาก "สถิติ" เป็น "แจ้งลา"
- [x] เมนู "ตารางเรียน" ปรับเป็นปฏิทินสัปดาห์ + รายวิชาตามวันที่เลือก

### 3.4 Check-in Feature *(สำคัญที่สุด)*
- [x] ปุ่มเช็คชื่อในคาบปัจจุบัน
- [x] ตรวจสอบ GPS — เช็ค lat/lng ว่าอยู่ในรัศมีอาคาร
- [x] แสดง error ถ้าอยู่นอกพื้นที่
- [x] บังคับถ่ายรูปก่อนกดเช็คชื่อ (ใช้กล้องผ่าน `image_picker` โหมด camera)
- [x] แสดง preview รูปก่อนส่ง
- [x] ส่ง API `multipart/form-data` (รูป + JSON)
- [x] แสดงผล: ตรงเวลา / มาสาย / error
- [x] BLoC: `CheckInBloc`
  - [x] State: `initial`, `checkingGPS`, `gpsError`, `submitting`, `success`, `failure`

### 3.5 Leave Request Feature
- [x] หน้ายื่นคำขอลา UX ใหม่ (dropdown รายวิชา + ประเภทลา + เหตุผล + แนบหลักฐาน)
- [x] แนบรูปหลักฐาน (optional)
- [x] ดูสถานะคำขอลาที่ยื่นไป
- [x] แสดง empty state: "ไม่พบรายการการลา"
- [x] แก้ payload ให้ตรง API (`attendanceRecordId`, `leaveType`, `evidence`)
- [x] เพิ่ม endpoint รองรับ dropdown รายวิชาเทอมปัจจุบัน (`GET /schedules/my`)
- [x] BLoC: `LeaveRequestBloc`

### 3.6 History Feature
- [x] หน้าประวัติการเข้าเรียนรายวิชา
- [x] แสดงสถานะแต่ละคาบ: ตรงเวลา / สาย / ขาด / ลา
- [x] แสดงเปอร์เซ็นต์การเข้าเรียน
- [x] BLoC: `HistoryBloc`

### 3.7 Notification
- [-] ตั้งค่า FCM (Firebase Cloud Messaging) — อยู่ระหว่าง verify token บนเครื่องจริง
- [x] เพิ่มโค้ดรับ permission/token + message handlers ใน Flutter
- [ ] รับ Push Notification เมื่อใกล้ถึงคาบเรียน (รอ backend ส่งจริง)
- [ ] รับ Push Notification เมื่อยังไม่เช็คหลังคาบเริ่ม (รอ backend ส่งจริง)
- [ ] รับ Push Notification เมื่อคำขอลาได้รับการอนุมัติ/ปฏิเสธ (รอ backend ส่งจริง)

---

## Phase 4 — Testing & QA

### Backend
- [ ] Unit Test: `AttendanceService` (check-in logic)
- [ ] Unit Test: `LeaveRequestService`
- [ ] Unit Test: `AuthService` (device binding)
- [ ] E2E Test: Check-in flow
- [ ] E2E Test: Leave request → approve flow

### Frontend Web
- [ ] ทดสอบ Import CSV — valid / invalid data
- [ ] ทดสอบ Role redirect (เข้า route ที่ไม่มีสิทธิ์)
- [ ] ทดสอบ Export รายงาน

### Flutter
- [ ] ทดสอบ GPS นอกพื้นที่ → ควร block
- [ ] ทดสอบ เช็คซ้ำในคาบเดียวกัน → ควร block
- [ ] ทดสอบ Device ไม่ตรง → ควร block
- [ ] ทดสอบ ไม่มีอินเทอร์เน็ต → แสดง error ชัดเจน

---

## Phase 5 — Deployment

- [ ] ตั้งค่า Server / Cloud (Backend + Database)
- [ ] ตั้งค่า Environment Variables Production
- [ ] Deploy Backend (NestJS)
- [ ] Deploy Frontend Web (Next.js)
- [ ] Build Flutter App (iOS + Android)
- [ ] ตั้งค่า Firebase Project (Push Notification)
- [ ] ตั้งค่า Storage สำหรับรูป Selfie (S3 / GCS / Supabase Storage)
- [ ] ทดสอบ End-to-End บน Production

---

## Backlog — Phase ถัดไป

- [ ] Face Liveness Detection (กัน Selfie โกง)
- [ ] GPS / VPN Spoofing Detection
- [ ] Integration กับระบบทะเบียนกลาง
- [ ] Dashboard Analytics ขั้นสูง (แนวโน้มการขาดเรียน)
- [ ] Teacher Mobile — ดูรายชื่อสดในห้อง

---

*อัพเดทล่าสุด: 2026-04-27 (session 4)*
