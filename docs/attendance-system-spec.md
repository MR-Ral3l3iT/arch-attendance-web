# ระบบเช็คชื่อ — เอกสารเริ่มต้นโปรเจค (Project Specification)

---

## 1. ภาพรวมของระบบ

### แนวคิดหลัก

ระบบเช็คชื่ออิงจาก **"บริบทของคาบเรียนจริง"** ไม่ได้อิงแค่ตำแหน่งเพียงอย่างเดียว  
โดยระบบจะตรวจสอบร่วมกัน **4 ส่วน** ก่อนอนุญาตให้เช็คชื่อ:

1. นักศึกษามีสิทธิ์เรียนในคาบนั้นจริงหรือไม่
2. ขณะนั้นอยู่ในช่วงเวลาที่สามารถเช็คชื่อได้หรือไม่
3. นักศึกษาอยู่ในขอบเขตอาคารที่กำหนดหรือไม่
4. นักศึกษาถ่ายภาพ Selfie สดผ่านกล้องของแอปหรือไม่

เมื่อผ่านเงื่อนไขทั้งหมด ระบบจะบันทึกการเข้าเรียนพร้อม **รูปภาพ / เวลา / ตำแหน่ง / ข้อมูลอุปกรณ์** เพื่อใช้เป็นหลักฐานย้อนหลัง

---

## 2. รูปแบบการใช้งานแยกตาม Role

| Role | Platform | เหตุผล |
|---|---|---|
| Admin กลาง | Web 100% | งานซับซ้อน, form/table เยอะ, ต้องหน้าจอใหญ่ |
| อาจารย์ | Web หลัก + Mobile เสริม | Web = ดูรายชื่อ/รายงาน, Mobile = เช็คสดในห้อง |
| นักศึกษา | Mobile 100% | ต้องใช้กล้อง, GPS, UX ต้องเร็ว |

---

## 3. Flow การทำงานแยกตาม Role

---

### 3.1 👨‍💼 Admin กลาง

**หน้าที่:** ดูแลโครงสร้างทั้งหมดของระบบ เพื่อให้ระบบรู้ว่าใครควรเรียนอะไร ที่ไหน และเมื่อไร

#### ขั้นที่ 1 — ตั้งค่าข้อมูลพื้นฐาน

- เพิ่มปีการศึกษา / ภาคการศึกษา
- เพิ่มคณะ / สาขา / ชั้นปี
- เพิ่มอาคาร / ห้องเรียน (พร้อมพิกัด GPS และรัศมีขอบเขต)

#### ขั้นที่ 2 — จัดการการเรียนการสอน

- เพิ่มรายวิชา
- สร้างกลุ่มเรียน / section
- กำหนดอาจารย์ผู้สอน
- กรอกตารางเรียน หรือ **Import CSV/Excel** (แต่ละสาขาจัดตารางเอง ไม่อิงระบบกลาง)
- ผูกตารางกับภาคการศึกษา

#### ขั้นที่ 3 — จัดการผู้ใช้งาน

- เพิ่มนักศึกษา ทีละราย หรือ **Bulk Import CSV/Excel**
- เพิ่มอาจารย์ ทีละราย หรือ **Bulk Import CSV/Excel**
- กำหนดสิทธิ์การใช้งาน

#### ขั้นที่ 4 — ผูกสิทธิ์เรียน

- กำหนดนักศึกษาเข้าคณะ / สาขา / ชั้นปี / กลุ่มเรียน / รายวิชา

#### ขั้นที่ 5 — กำหนดเงื่อนไขเช็คชื่อ (ระดับ Default ของระบบ)

- รัศมีขอบเขตอาคาร (หน่วย: เมตร)
- ช่วงเวลาที่อนุญาตให้เช็คชื่อ (เช่น เปิดก่อนคาบ 15 นาที)
- เกณฑ์มาสาย (เช่น เกิน 15 นาทีหลังคาบเริ่ม)
- เกณฑ์ขาดเรียน (เช่น เกิน 30 นาที หรือไม่เช็คเลย)

> ค่าเหล่านี้คือ **Default ของระบบ** — อาจารย์สามารถ override ได้รายวิชา

#### ขั้นที่ 6 — ตรวจสอบและรายงาน

- ดูสถิติการเข้าเรียนภาพรวมทั้งระบบ
- ดูรูปหลักฐานย้อนหลัง
- ตรวจสอบรายการผิดปกติ
- Export รายงานระดับคณะ / สาขา / วิชา

---

### 3.2 👨‍🏫 อาจารย์

**หน้าที่:** ติดตามการเข้าเรียน ตรวจหลักฐาน อนุมัติกรณีพิเศษ ออกรายงาน

#### ขั้นที่ 1 — เข้าสู่ระบบ

- Login → เข้า Dashboard อาจารย์

#### ขั้นที่ 2 — ดูรายวิชาที่สอน

- รายวิชาที่รับผิดชอบ
- ตารางสอน วัน / เวลา / ห้อง

#### ขั้นที่ 3 — ปรับเงื่อนไขเช็คชื่อรายวิชา *(Override)*

อาจารย์สามารถปรับค่าได้เองสำหรับแต่ละวิชาที่ตัวเองสอน:

| เงื่อนไข | ตัวอย่าง |
|---|---|
| ช่วงเวลาที่เปิดให้เช็ค | เปิดก่อนคาบ 10 นาที / ปิดหลังคาบเริ่ม 20 นาที |
| เกณฑ์มาสาย | เกิน 15 นาทีหลังคาบเริ่ม = สาย |
| เกณฑ์ขาดเรียน | เกิน 30 นาที หรือไม่เช็คเลย = ขาด |

> ถ้าอาจารย์ไม่ปรับ → ระบบใช้ค่า Default จาก Admin โดยอัตโนมัติ

#### ขั้นที่ 4 — ดูสถานะเช็คชื่อรายคาบ

- เลือกวิชา → เลือกคาบ / วันที่
- ดูรายชื่อนักศึกษาพร้อมสถานะ:
  - ✅ เช็คแล้ว — ตรงเวลา
  - ⏰ มาสาย
  - ❌ ขาดเรียน
  - 🏥 ลา (ได้รับการอนุมัติ)
  - ⬜ ยังไม่เช็ค

#### ขั้นที่ 5 — ตรวจสอบหลักฐาน

- ดูรูป Selfie ของนักศึกษาแต่ละคน
- ดูเวลาเช็คชื่อ
- ดูตำแหน่งที่ระบบบันทึก
- ดูข้อมูลอุปกรณ์เบื้องต้น
- ดูรายการ **Flag ผิดปกติ**: เช็คนอกพื้นที่ / ผิดเวลา / รูปผิดปกติ / เช็คซ้ำ

#### ขั้นที่ 6 — อนุมัติกรณีพิเศษ

**กรณี นักศึกษาลา / ป่วย:**

```
นักศึกษากรอกคำขอลา (ระบุเหตุผล + แนบหลักฐาน ถ้ามี)
        ↓
อาจารย์รับ Notification แจ้งเตือน
        ↓
อาจารย์อนุมัติ / ปฏิเสธ
        ↓
ระบบเปลี่ยนสถานะเป็น "ลา" + บันทึก Audit Log
```

**กรณี ลืมเช็ค / ปัญหาทางเทคนิค:**

```
นักศึกษาแจ้งผ่านระบบ (ระบุเหตุผล)
        ↓
อาจารย์ตรวจสอบและอนุมัติ
        ↓
ระบบบันทึก "แก้ไขโดยอาจารย์" + timestamp + เหตุผล
```

> ⚠️ ทุกการแก้ไขสถานะต้องมี **Audit Log** บันทึกครบ (ใครแก้ / เมื่อไร / เหตุผลอะไร)

#### ขั้นที่ 7 — สรุปและออกรายงาน

- ดูเปอร์เซ็นต์เข้าเรียนรายวิชา
- Export รายชื่อการเข้าเรียน
- ใช้ประกอบการตัดสิทธิ์สอบ / เก็บคะแนน

---

### 3.3 👩‍🎓 นักศึกษา

**หน้าที่:** เช็คชื่อเข้าเรียน ยื่นคำขอลา ดูประวัติการเข้าเรียน

#### ขั้นที่ 1 — เข้าสู่ระบบ

- Login ด้วยรหัสนักศึกษา / บัญชีมหาวิทยาลัย
- ระบบผูกข้อมูลกับ คณะ / สาขา / ชั้นปี / กลุ่มเรียน
- ระบบผูก **Device อัตโนมัติ** (1 คน = 1 เครื่องเท่านั้น)
  - หากต้องการเปลี่ยนเครื่อง → ต้องติดต่อ Admin เพื่อผูก device ใหม่

#### ขั้นที่ 2 — ดู Dashboard

- คาบเรียนวันนี้ทั้งหมด
- คาบปัจจุบันที่กำลังเรียน
- สถานะแต่ละคาบ (เช็คแล้ว / ยังไม่เช็ค)

#### ขั้นที่ 3 — รับการแจ้งเตือน

- แจ้งเตือนก่อนคาบเรียน 15 นาที
- แจ้งเตือนเมื่อคาบเริ่มแล้วยังไม่เช็คชื่อ

#### ขั้นที่ 4 — กดเช็คชื่อ

ระบบตรวจสอบทันที (ต้องออนไลน์เท่านั้น):

```
✅ มีสิทธิ์เรียนวิชานี้
✅ อยู่ในช่วงเวลาที่อนุญาต (ตามเงื่อนไขของวิชานั้น)
✅ อยู่ในขอบเขตอาคารที่กำหนด
✅ ยังไม่เคยเช็คในคาบนี้
✅ เช็คจาก Device ที่ผูกไว้เท่านั้น
```

#### ขั้นที่ 5 — ถ่าย Selfie สด

- เปิดกล้องสดเท่านั้น — ห้าม upload รูปจากเครื่อง
- แนบ เวลา + พิกัด + device info อัตโนมัติ

#### ขั้นที่ 6 — บันทึกการเข้าเรียน

เมื่อส่งรูปสำเร็จ ระบบบันทึก:

- สถานะ: **ตรงเวลา** หรือ **มาสาย** (อิงเกณฑ์ของวิชานั้น)
- ข้อมูลที่เก็บ: รูปถ่าย / เวลา / พิกัด GPS / device info / log การเช็คชื่อ

#### ขั้นที่ 7 — ยื่นคำขอลา

- เลือกวิชา + คาบที่ต้องการลา
- กรอกเหตุผล + แนบหลักฐาน (ถ้ามี)
- รอการอนุมัติจากอาจารย์
- รับแจ้งเตือนเมื่ออาจารย์ อนุมัติ / ปฏิเสธ

#### ขั้นที่ 8 — ดูประวัติย้อนหลัง

- สถานะรายคาบ: เช็คแล้ว / มาสาย / ขาด / ลา
- เปอร์เซ็นต์การเข้าเรียนของตนเองแต่ละวิชา

---

## 4. ระบบแจ้งเตือน (Notification)

| เหตุการณ์ | ผู้รับ | ช่องทาง |
|---|---|---|
| ใกล้ถึงเวลาคาบ (15 นาที) | นักศึกษา | Push Notification |
| คาบเริ่มแล้ว ยังไม่เช็คชื่อ | นักศึกษา | Push Notification |
| มีคำขอลาใหม่รอการอนุมัติ | อาจารย์ | Push / Web |
| มีรายการเช็คชื่อผิดปกติ | อาจารย์ | Push / Web |
| คำขอลาได้รับการอนุมัติ / ปฏิเสธ | นักศึกษา | Push Notification |

---

## 5. Bulk Import

| ข้อมูล | วิธีนำเข้า | หมายเหตุ |
|---|---|---|
| นักศึกษา | Import CSV / Excel | รองรับหลักร้อย–พันคน |
| อาจารย์ | Import CSV / Excel | — |
| รายวิชา | Import CSV / Excel | — |
| ตารางเรียน | กรอกเอง หรือ Import CSV | แต่ละสาขาจัดตารางเอง ไม่อิงระบบกลาง |

### Template CSV/Excel ที่ต้องจัดเตรียม

**`students_template.xlsx`** *(Excel — ดาวน์โหลดได้จากหน้า Admin → นักศึกษา)*
```
ลำดับ, รหัสนักศึกษา, ชื่อ, นามสกุล, Username, Password, สาขา*, ชั้นปี*
```
> \* คอลัมน์ สาขา และ ชั้นปี มี Dropdown Validation ดึงมาจาก API จริงในขณะดาวน์โหลด  
> รองรับทั้ง `.csv` และ `.xlsx` — ถ้า Excel จะแปลงเป็น CSV อัตโนมัติก่อนส่ง API

**`teachers_template.csv`**
```
รหัสอาจารย์, ชื่อ, นามสกุล, คณะ, สาขา
```

**`courses_template.csv`**
```
รหัสวิชา, ชื่อวิชา, หน่วยกิต, คณะ, สาขา
```

**`schedule_template.csv`**
```
รหัสวิชา, กลุ่มเรียน, วัน, เวลาเริ่ม, เวลาสิ้นสุด, ห้องเรียน, อาคาร, รหัสอาจารย์
```

---

## 6. ข้อกำหนดทางเทคนิค (Technical Constraints)

### 6.1 Offline Handling
- ระบบ **ต้องออนไลน์เท่านั้น** ในขณะเช็คชื่อ
- ไม่รองรับการบันทึก local แล้วค่อย sync ภายหลัง
- เหตุผล: ป้องกันการโกง และลด complexity ของระบบ

### 6.2 Anti-Spoofing
- ระบบ **Flag และ Log** รายการที่ผิดปกติอัตโนมัติ:
  - GPS coordinates ผิดปกติ / กระโดดไกล
  - เช็คนอกขอบเขตอาคาร
  - เช็คซ้ำในคาบเดียวกัน
  - รูปผิดปกติ
- อาจารย์เป็นผู้ **ตรวจสอบ Flag** เหล่านี้เอง
- ไม่มี liveness detection ใน Phase 1

### 6.3 Device Binding
- นักศึกษา **1 คน ผูกได้ 1 เครื่องเท่านั้น**
- ผูก Device อัตโนมัติเมื่อ Login ครั้งแรก
- หากต้องการเปลี่ยนเครื่อง → ต้องติดต่อ Admin เพื่อ reset และผูก device ใหม่

### 6.4 Audit Log
- ทุกการแก้ไขสถานะการเช็คชื่อต้องมี Audit Log บันทึก:
  - ใครเป็นคนแก้ไข
  - แก้ไขเมื่อเวลาใด (timestamp)
  - เหตุผลในการแก้ไข
  - สถานะก่อน / หลังการแก้ไข

---

## 7. ลำดับการ Setup ระบบ (Onboarding Order)

```
1. Admin สร้างปีการศึกษา / ภาคการศึกษา
        ↓
2. Admin สร้างคณะ / สาขา / ชั้นปี
        ↓
3. Admin สร้างอาคาร / ห้องเรียน (+ พิกัด GPS + รัศมี)
        ↓
4. Admin Import หรือเพิ่มข้อมูลอาจารย์
        ↓
5. Admin Import หรือเพิ่มข้อมูลนักศึกษา
        ↓
6. Admin / สาขา สร้างรายวิชา + กลุ่มเรียน + ตารางเรียน
        ↓
7. Admin ผูกนักศึกษาเข้ากลุ่มเรียน / รายวิชา
        ↓
8. Admin กำหนด Default เงื่อนไขเช็คชื่อ
        ↓
9. อาจารย์ Login → ปรับเงื่อนไขรายวิชา (ถ้าต้องการ)
        ↓
10. นักศึกษา Login → ผูก Device → พร้อมใช้งาน
```

---

## 8. สรุปสถานะความครบถ้วน (Feature Design)

| Feature | สถานะ Design | หมายเหตุ |
|---|---|---|
| Core Flow (3 roles) | ✅ ครบ | Admin / Teacher / Student |
| 4-factor Verification | ✅ ครบ | สิทธิ์ + เวลา + พื้นที่ + Selfie |
| เงื่อนไขเช็คชื่อ Default (Admin) | ✅ ครบ | ตั้งค่าระดับระบบ |
| เงื่อนไขเช็คชื่อ Override (อาจารย์) | ✅ ครบ | ปรับได้รายวิชา |
| การลา / ป่วย | ✅ ครบ | นักศึกษากรอก → อาจารย์อนุมัติ |
| ลืมเช็ค / ปัญหาเทคนิค | ✅ ครบ | อาจารย์อนุมัติ |
| Audit Log การแก้ไข | ✅ ครบ | ทุกการแก้ไขมี log |
| Notification | ✅ ครบ | Push ทั้ง นักศึกษา และอาจารย์ |
| Bulk Import | ✅ ครบ | CSV / Excel พร้อม Template |
| ตารางเรียน | ✅ ครบ | กรอกเอง / Import เอง รายสาขา |
| Offline Handling | ✅ ตัดสินใจแล้ว | ออนไลน์เท่านั้น |
| Anti-spoofing | ✅ ตัดสินใจแล้ว | Log + อาจารย์ตรวจ |
| Device Binding | ✅ ตัดสินใจแล้ว | 1 คน = 1 เครื่อง |

---

## 8.1 สถานะการพัฒนาจริง (Development Progress)

*อัปเดตล่าสุด: 2026-04-27 (session 4)*

| Phase | สถานะ | รายละเอียด |
|---|---|---|
| Phase 0 — Project Setup | ✅ เสร็จ | 3 repos + docker-compose + ESLint/Prettier |
| Phase 1 — Backend (NestJS) | ✅ เสร็จ | API ครบทุก module รวม Division + SystemSettings; รอ Firebase credentials สำหรับ push notification จริง |
| Phase 2 — Frontend Web (Next.js) | ✅ เสร็จ | ทุกหน้า Admin + Teacher build ผ่าน, TypeScript + ESLint clean; PageHeader มี icon; Pagination limit=20 ทุกหน้า; Division tab + SystemSettings page ใช้งานได้ |
| Phase 3 — Mobile App (Flutter) | 🔄 กำลังพัฒนา | ฟีเจอร์หลักใช้งานได้: Login, Dashboard, Check-in, Leave Request, History, Profile; iOS/Android Firebase setup อยู่ระหว่าง verify push token |
| Phase 4 — Testing & QA | ⏳ ยังไม่เริ่ม | รอ Phase 3 เสร็จ |
| Phase 5 — Deployment | ⏳ ยังไม่เริ่ม | |

### สิ่งที่ต้องทำต่อ (ลำดับความสำคัญ)
1. **Push Notification production verify** — ทดสอบ token บน iOS เครื่องจริง + Android device/emulator
2. **Backend notification sender** — เชื่อม firebase-admin ส่ง push จริงตาม trigger ที่ออกแบบ

---

## 8.2 URLs และ Credentials สำหรับทดสอบ (Local Development)

### Service URLs

| Service | URL | หมายเหตุ |
|---|---|---|
| **Backend API** | `http://localhost:3000` | NestJS — `npm run start:dev` |
| **Swagger UI** | `http://localhost:3000/api/docs` | API docs ครบทุก endpoint |
| **Frontend Web** | `http://localhost:3001` | Next.js — `npm run dev` (auto-select port เมื่อ 3000 ถูกใช้) |
| **Database** | `localhost:5432` | PostgreSQL — `brew services start postgresql@16` |

> **หมายเหตุ:** รัน API ก่อน แล้วค่อยรัน Web — Next.js จะ auto-select port 3001 เมื่อ 3000 ถูก API ใช้อยู่
> หรือระบุ port ตรง ๆ ด้วย `next dev -p 3001`

---

### Credentials ทดสอบ (จาก `prisma/seed.ts`)

> รัน seed ด้วย `cd attendance-api && npx prisma db seed` ก่อนทดสอบ

#### 👨‍💼 Admin

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin1234` |
| เข้าสู่ระบบที่ | `http://localhost:3001/login` |
| Redirect ไป | `http://localhost:3001/admin` |

#### 👨‍🏫 Teacher (อาจารย์)

| Field | Value |
|---|---|
| Username | `teacher001` |
| Password | `teacher1234` |
| ชื่อ | สมชาย ใจดี |
| รหัสอาจารย์ | T001 |
| สังกัด | คณะวิศวกรรมศาสตร์ — วิทยาการคอมพิวเตอร์ |
| เข้าสู่ระบบที่ | `http://localhost:3001/login` |
| Redirect ไป | `http://localhost:3001/teacher` |

#### 👩‍🎓 Students (นักศึกษา) — รหัสผ่านเหมือนกันทุกคน: `student1234`

| Username | ชื่อ | ชั้นปี | Email |
|---|---|---|---|
| `6701001` | สมหญิง มีสุข | ชั้นปีที่ 1 | somying@student.ac.th |
| `6701002` | วิชัย ขยันเรียน | ชั้นปีที่ 1 | wichai@student.ac.th |
| `6601001` | นภา ฉลาดดี | ชั้นปีที่ 2 | napa@student.ac.th |

> นักศึกษาเข้าระบบผ่าน **Flutter Mobile App เท่านั้น** (ไม่มีหน้า Web สำหรับ Student)

---

### Web Paths แยกตาม Role

#### Admin — `http://localhost:3001/admin/...`

| Path | หน้า |
|---|---|
| `/admin` | Dashboard ภาพรวม (สถิติรวม) |
| `/admin/academic` | ปีการศึกษา / ภาคเรียน / คณะ / **ภาควิชา** / สาขา / ชั้นปี |
| `/admin/buildings` | อาคาร / ห้องเรียน (พร้อม GPS) |
| `/admin/courses` | รายวิชา / กลุ่มเรียน / ผูก นศ |
| `/admin/schedules` | ตารางเรียน |
| `/admin/students` | จัดการนักศึกษา + Import CSV + Reset Device |
| `/admin/teachers` | จัดการอาจารย์ + Import CSV |
| `/admin/settings` | ตั้งค่าเงื่อนไขเช็คชื่อ Default |
| `/admin/reports` | รายงานภาพรวม + Export |

#### Teacher — `http://localhost:3001/teacher/...`

| Path | หน้า |
|---|---|
| `/teacher` | Dashboard (ตารางวันนี้ + สถิติ) |
| `/teacher/attendance` | เลือกวิชา / คาบที่ต้องการดู |
| `/teacher/attendance/[scheduleId]?classDate=YYYY-MM-DD` | รายชื่อ นศ + สถานะ + แก้ไข + Selfie |
| `/teacher/attendance/flags` | รายการผิดปกติ (Flag) |
| `/teacher/leave-requests` | คำขอลาที่รอการอนุมัติ |
| `/teacher/settings` | Override เงื่อนไขเช็คชื่อรายวิชา |
| `/teacher/reports` | รายงานรายวิชา + Export |

---

### Key API Endpoints (สำหรับทดสอบผ่าน Swagger หรือ Postman)

| Method | Path | Role | คำอธิบาย |
|---|---|---|---|
| `POST` | `/auth/login` | ทุก role | รับ JWT token |
| `POST` | `/auth/refresh` | ทุก role | ต่ออายุ token |
| `POST` | `/attendance/check-in` | Student | เช็คชื่อ (multipart/form-data) |
| `GET` | `/attendance/schedule/:scheduleId` | Teacher | รายชื่อ นศ รายคาบ |
| `PATCH` | `/attendance/:id/status` | Teacher | แก้ไขสถานะ |
| `GET` | `/attendance/flags` | Teacher | รายการผิดปกติ |
| `POST` | `/leave-requests` | Student | ยื่นคำขอลา |
| `PATCH` | `/leave-requests/:id/approve` | Teacher | อนุมัติคำขอลา |
| `GET` | `/reports/schedule/:scheduleId` | Teacher/Admin | สรุปรายวิชา |
| `GET` | `/reports/export` | Admin | Export ข้อมูล |

> ดู endpoint ทั้งหมดได้ที่ **Swagger UI**: `http://localhost:3000/api/docs`

---

### ข้อมูล Seed ที่สร้างไว้

| ข้อมูล | รายละเอียด |
|---|---|
| คณะ | คณะวิศวกรรมศาสตร์ (ENG) |
| สาขา | วิทยาการคอมพิวเตอร์ (CS) |
| อาคาร | อาคารวิศวกรรม 1 (B01) — พิกัด 13.7563, 100.5018 รัศมี 100 m |
| ห้องเรียน | B01-101 (ความจุ 40 คน) |
| รายวิชา | CS101 — การเขียนโปรแกรมคอมพิวเตอร์ (3 หน่วยกิต) |
| กลุ่มเรียน | กลุ่ม 1 |
| ตารางเรียน | จันทร์ 08:00–11:00 ห้อง B01-101 (ภาคเรียน 1/2567) |
| เงื่อนไขเช็คชื่อ | เปิดก่อนคาบ 15 นาที, มาสายหลัง 15 นาที, ขาดหลัง 30 นาที |

---

## 9. สิ่งที่ต้องพัฒนาต่อใน Phase ถัดไป *(Future Roadmap)*

| Feature | เหตุผล |
|---|---|
| Face Liveness Detection | กันใช้รูปถ่ายแทนหน้าจริง |
| GPS / VPN Spoofing Detection | ตรวจจับการปลอมพิกัด |
| Integration กับระบบทะเบียนกลาง | Import ตารางเรียนอัตโนมัติ |
| Dashboard Analytics ขั้นสูง | วิเคราะห์แนวโน้มการขาดเรียน |

---

## 10. Tech Stack (เวอร์ชันจริงที่ใช้)

| Layer | Technology | Version |
|---|---|---|
| Frontend Web | Next.js | 15.5.15 (ล็อค exact) |
| Frontend Web | TailwindCSS + Lucide Icons | — |
| Frontend Web | react-hook-form + Zod | v7 + v4 |
| Frontend Web | Zustand (auth/toast store) | — |
| Frontend Web | xlsx (SheetJS community) | v0.18.5 — อ่าน/เขียน Excel |
| Frontend Web | fflate | — ZIP manipulation สำหรับ inject dataValidations ใน xlsx |
| Backend | NestJS + Node.js | — |
| Backend | Prisma ORM | v5 (รองรับ Node 21) |
| Backend | PostgreSQL | 16 |
| Backend | Swagger (Thai labels) | — |
| Mobile | Flutter + flutter_bloc | — |
| Mobile | Dio | HTTP client |

---

## 11. การตัดสินใจทางเทคนิคระหว่างพัฒนา

### 11.1 Node.js Version
- **ปัจจุบัน:** v21.6.1 (EOL — End of Life)
- **แนะนำ:** อัปเกรดเป็น **Node 22 LTS** ด้วย nvm
- **ผลกระทบ:** Prisma 6 ต้องการ Node 20.19+ / 22.12+ — ปัจจุบันใช้ Prisma 5 แทน

### 11.2 Prisma Version
- ใช้ **Prisma 5** (`v5.22.0`) เพราะ Node 21 ไม่รองรับ Prisma 6
- เมื่ออัปเกรด Node เป็น 22 LTS แล้ว สามารถอัปเกรด Prisma เป็น 6 ได้

### 11.3 Next.js Version
- ล็อคที่ **15.5.15** (exact version, ไม่มี `^`)
- App Router ใช้งานได้เต็มรูปแบบ API เข้ากันได้กับ Next.js 14

### 11.4 Local Database (Development)
- ใช้ **PostgreSQL ผ่าน Homebrew** แทน Docker (เพื่อหลีกเลี่ยงปัญหา network/TLS ของ Docker Hub)
- Connection string: `postgresql://attendance_user:2026_attendance_pass@localhost:5432/attendance_db`
- รัน: `brew services start postgresql@16`

### 11.5 ไฟล์ที่ตัดออก
- ลบ `pgAdmin` ออกจาก `docker-compose.yml` — ใช้ TablePlus หรือ psql แทน
- ลบ boilerplate `app.controller.ts`, `app.service.ts` ที่ไม่ใช้งาน

## 12. โครงสร้างโปรเจค (ที่ implement จริง)
1. ภาพรวม Monorepo vs Separate Repo แยก 3 Repo ให้ชัดเจน:
attendance-system/
├── attendance-api/        ← NestJS Backend
├── attendance-web/        ← Next.js (Admin + Teacher)
└── attendance-app/        ← Flutter (Student + Teacher mobile)

2. โครงสร้าง Backend (NestJS)
attendance-api/
├── src/
│   ├── modules/
│   │   ├── auth/                  ← Login, JWT, Guard
│   │   ├── users/                 ← Admin, Teacher, Student
│   │   ├── academic/              ← ปีการศึกษา, ภาค, คณะ, ภาควิชา, สาขา
│   │   ├── buildings/             ← อาคาร, ห้องเรียน, พิกัด
│   │   ├── courses/               ← รายวิชา, กลุ่มเรียน
│   │   ├── schedules/             ← ตารางเรียน
│   │   ├── enrollments/           ← ผูก นศ กับรายวิชา
│   │   ├── attendance/            ← เช็คชื่อ, สถานะ, หลักฐาน
│   │   ├── leave-requests/        ← คำขอลา, อนุมัติ
│   │   ├── notifications/         ← Push notification
│   │   ├── reports/               ← Export รายงาน
│   │   ├── audit-logs/            ← บันทึกการแก้ไขทั้งหมด
│   │   └── system-settings/       ← ค่า default ระดับระบบ (key-value)
│   ├── common/
│   │   ├── guards/                ← Auth, Role guard
│   │   ├── decorators/            ← @Roles, @CurrentUser
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                    ← ENV, DB config
│   └── main.ts                    ← Swagger setup
├── prisma/
│   ├── schema.prisma              ← DB schema
│   └── migrations/
└── .env

3. โครงสร้าง Web (Next.js) — ที่ implement จริง
attendance-web/
├── app/
│   ├── (auth)/login/                     ← หน้า Login
│   │
│   ├── (admin)/admin/                    ← Layout Admin
│   │   ├── page.tsx                      ← Dashboard ภาพรวม
│   │   ├── academic/page.tsx             ← ปีการศึกษา / ภาค / คณะ / ภาควิชา / สาขา / ชั้นปี (Tabs)
│   │   ├── buildings/page.tsx            ← อาคาร + ห้องเรียน (Tabs)
│   │   ├── courses/page.tsx              ← รายวิชา + กลุ่มเรียน + Enrollment (Tabs)
│   │   ├── schedules/page.tsx            ← ตารางเรียน
│   │   ├── students/page.tsx             ← จัดการนักศึกษา + Import CSV + Reset Device
│   │   ├── teachers/page.tsx             ← จัดการอาจารย์ + Import CSV
│   │   ├── settings/page.tsx             ← Default เงื่อนไขเช็คชื่อ
│   │   └── reports/page.tsx              ← รายงาน + Export
│   │
│   └── (teacher)/teacher/               ← Layout Teacher
│       ├── page.tsx                     ← Dashboard (ตารางวันนี้ + สถิติ)
│       ├── attendance/
│       │   ├── page.tsx                 ← เลือกวิชา → เลือกคาบ
│       │   ├── [scheduleId]/page.tsx    ← รายชื่อ นศ + สถานะ + แก้ไข + Selfie
│       │   └── flags/page.tsx           ← รายการผิดปกติ
│       ├── leave-requests/page.tsx      ← อนุมัติ / ปฏิเสธ คำขอลา
│       ├── reports/page.tsx             ← รายงานรายวิชา + Export
│       └── settings/page.tsx           ← Override เงื่อนไขเช็คชื่อรายวิชา
│
├── components/
│   ├── ui/                              ← Button, Input, Modal, Table, Badge, etc.
│   └── layout/                          ← Sidebar, Header
│
├── hooks/useFetch.ts                    ← Generic data fetching
├── lib/api.ts                           ← Axios + JWT interceptor + auto refresh
├── lib/utils.ts                         ← cn(), formatDate, status labels
├── middleware.ts                        ← Role guard + redirect
├── store/auth.store.ts                  ← Zustand + persist (cookie sync)
├── store/toast.store.ts                 ← Global toast (ใช้ได้นอก React)
└── types/index.ts                       ← TypeScript types ครบ (sync กับ Prisma)

4. โครงสร้าง Mobile (Flutter)
attendance-app/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── routes/            ← App routing
│   │   └── theme/             ← Theme, colors
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/       ← Login screen
│   │   │   └── bloc/          ← State management
│   │   ├── dashboard/
│   │   │   ├── screens/       ← คาบเรียนวันนี้
│   │   │   └── bloc/
│   │   ├── attendance/
│   │   │   ├── screens/       ← กดเช็คชื่อ, กล้อง Selfie
│   │   │   ├── bloc/
│   │   │   └── widgets/       ← Camera widget, GPS checker
│   │   ├── leave-request/
│   │   │   ├── screens/       ← ยื่นคำขอลา
│   │   │   └── bloc/
│   │   └── history/
│   │       ├── screens/       ← ประวัติย้อนหลัง
│   │       └── bloc/
│   │
│   ├── core/
│   │   ├── api/               ← Dio HTTP client
│   │   ├── services/
│   │   │   ├── camera_service.dart
│   │   │   ├── location_service.dart
│   │   │   ├── device_service.dart
│   │   │   └── notification_service.dart
│   │   └── utils/
│   │
│   └── shared/
│       ├── widgets/           ← Shared UI components
│       └── models/            ← Data models
│
└── pubspec.yaml

5. Key Packages ที่ใช้จริง

NestJS Backend (ติดตั้งแล้ว)
- `@nestjs/jwt` + `passport` — Authentication
- `@nestjs/swagger` — Auto API docs (Thai labels ครบ)
- `prisma` v5 — ORM
- `firebase-admin` — Push notification (รอ credentials)
- `multer` — รับรูป Selfie (max 5MB)
- `class-validator` + `class-transformer` — DTO validation
- `@nestjs/schedule` — Cron Job notification

Next.js Web (ติดตั้งและใช้งานจริง)
- `axios` — API client + JWT interceptor
- `zustand` — State management (auth + toast)
- `react-hook-form` v7 + `zod` v4 — Form + validation
- `@hookform/resolvers` — Zod resolver

Flutter Mobile (pubspec.yaml พร้อม รอ implement)
- `flutter_bloc` — State management
- `dio` — HTTP client
- `camera` — ถ่าย Selfie สด (ไม่ใช้ image_picker)
- `geolocator` — GPS
- `device_info_plus` — Device binding
- `firebase_messaging` — Push notification
- `shared_preferences` — เก็บ token
- `permission_handler` — จัดการ permissions

---

## 13. หมายเหตุทางเทคนิค (Build Notes)

### Next.js Web
- `z.coerce.number()` ใน Zod v4 + `zodResolver` มี type mismatch กับ `useForm<T>` — แก้โดยใช้ `resolver: zodResolver(schema) as any`
- `useSearchParams()` ต้องครอบด้วย `<Suspense>` ใน Next.js 15 (static prerender)
- Ternary `await` expressions ต้อง refactor เป็น `if/else` (ESLint `no-unused-expressions`)
- Lucide `<Image>` component ต้อง import as `ImageIcon` เพื่อหลีกเลี่ยง `jsx-a11y/alt-text` false positive
- `await import("xlsx")` ใน Next.js Webpack จะ wrap CommonJS module — ต้องใช้ `(mod as any).default ?? mod` เพื่อดึง default export
- `XLSX.writeFile()` ไม่ทำงานใน browser — ใช้ `XLSX.write(..., { type: "array" })` แล้ว download ผ่าน `Blob + URL.createObjectURL`
- `xlsx` v0.18.5 (community) ไม่รองรับการเขียน `<dataValidations>` — แก้โดยใช้ `fflate` (`unzipSync` → patch `xl/worksheets/sheet1.xml` → `zipSync`) inject XML ตรงหลัง `</worksheet>`
- `<dataValidations>` XML ต้องใช้ HTML-escaped quotes: `&quot;val1,val2&quot;` (ไม่ใช่ `"val1,val2"`)
- inline `<input>` ที่อยู่คู่กับ `<Select>` component ต้องใช้ `h-10` (ไม่ใช่ `h-9`) เพื่อความสูงที่เท่ากัน
- Sections API อาจ return `semester` โดยไม่มี nested `academicYear` — ต้อง optional chain: `r.semester?.academicYear?.name`
- `Section` ต้องมี `semesterId` (required) ใน Prisma schema — ถ้าไม่มี backend จะไม่ include `semester` ใน response
- `prisma migrate dev` block เมื่อมี existing data กับ NOT NULL column — ใช้ `prisma db push --force-reset` แล้ว seed ใหม่
- `prisma db push` ต้องการ `GRANT ALL ON SCHEMA public` + `ALTER USER ... SUPERUSER` สำหรับ `attendance_user`
- `seed.ts` ต้อง update unique key ตาม schema: `courseId_semesterId_name` (ไม่ใช่ `courseId_name` อีกต่อไป)
- `SystemSettings` ใช้ pattern key-value ใน DB — service map key → friendly object, ใส่ DEFAULTS fallback ถ้า key ไม่มีใน DB
- `PageHeader` icon prop: render ใน `div` ขนาด `w-10 h-10 rounded-xl bg-primary/10 text-primary` — icon size แนะนำ 20px
