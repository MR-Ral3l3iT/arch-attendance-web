// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type AttendanceStatus =
  | "ON_TIME"
  | "LATE"
  | "ABSENT"
  | "LEAVE"
  | "NOT_CHECKED";

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveType = "SICK" | "PERSONAL";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  /** จาก API login (ใช้แสดงชื่อ fallback สำหรับ ADMIN ฯลฯ) */
  username?: string;
  email?: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  studentId?: string;
  teacherId?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  deviceId?: string;
  deviceInfo?: Record<string, unknown>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Academic ─────────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  /** ชื่อปีการศึกษา (พ.ศ.) เช่น "2567" — ตรงกับฟิลด์ `name` ใน Prisma/API */
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  academicYear: AcademicYear;
}

export interface Faculty {
  id: string;
  code: string;
  name: string;
}

export interface Division {
  id: string;
  code: string;
  name: string;
  faculty: Faculty;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  faculty: Faculty;
  division?: Division;
}

// ─── Building & Room ──────────────────────────────────────────────────────────

export interface Building {
  id: string;
  code: string;
  name: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  building: Building;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Teacher {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  profileImageUrl?: string | null;
  user: { username: string; isActive: boolean };
  department: Department;
  faculty?: Faculty;
}

export interface Student {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  profileImageUrl?: string | null;
  user: { username: string; isActive: boolean };
  department: Department;
  faculty?: Faculty;
  yearLevel?: { id: string; level: number; name: string };
  deviceId?: string;
}

// ─── Course & Schedule ────────────────────────────────────────────────────────

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: Department;
}

export interface Section {
  id: string;
  name: string;
  maxStudents?: number;
  course: Course;
  semesterId: string;
  semester: Semester;
  yearLevelId?: string | null;
  yearLevel?: { id: string; level: number; name: string } | null;
}

/** อาจารย์ที่แนบกับ Schedule จาก API (ชื่ออยู่ที่โมเดล Teacher ไม่ได้อยู่ที่ User) */
export interface ScheduleTeacher {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}

export interface Schedule {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  section: Section;
  room: Room;
  teacher: ScheduleTeacher;
}

export interface Enrollment {
  id: string;
  studentId: string;
  student: Student;
  sectionId: string;
  section: Section;
  createdAt: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceSettings {
  id: string;
  lateThresholdMinutes: number;
  gpsRadiusMeters: number;
  requireSelfie: boolean;
  schedule: Schedule;
}

export interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  classDate: string;
  checkInTime?: string;
  latitude?: number;
  longitude?: number;
  selfieUrl?: string;
  isAnomalous: boolean;
  note?: string;
  student: Student;
  schedule: Schedule;
}

// ─── Leave Request ────────────────────────────────────────────────────────────

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  reason: string;
  status: LeaveRequestStatus;
  classDate: string;
  evidenceUrl?: string;
  reviewedAt?: string;
  reviewNote?: string;
  student: Student;
  schedule: Schedule;
  reviewer?: User;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Report ───────────────────────────────────────────────────────────────────

export interface AttendanceSummary {
  studentId: string;
  studentCode: string;
  studentName: string;
  total: number;
  onTime: number;
  late: number;
  absent: number;
  leave: number;
  attendanceRate: number;
}

// ─── API Pagination ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ScheduleStats {
  total: number;
  onTime: number;
  late: number;
  absent: number;
  leave: number;
  notChecked: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
