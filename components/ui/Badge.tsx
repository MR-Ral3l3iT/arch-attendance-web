import { cn } from "@/lib/utils";
import { attendanceStatusLabel, leaveStatusLabel, roleLabel } from "@/lib/utils";
import type { AttendanceStatus, LeaveRequestStatus, Role } from "@/types";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "secondary";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   "bg-gray-100 text-gray-700",
  success:   "bg-success/10 text-success-700",
  warning:   "bg-warning/10 text-warning-700",
  danger:    "bg-danger/10 text-danger-700",
  info:      "bg-info/10 text-info-700",
  secondary: "bg-gray-200 text-gray-600",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const attendanceVariantMap: Record<AttendanceStatus, BadgeVariant> = {
  ON_TIME:     "success",
  LATE:        "warning",
  ABSENT:      "danger",
  LEAVE:       "info",
  NOT_CHECKED: "secondary",
};

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return (
    <Badge variant={attendanceVariantMap[status]}>
      {attendanceStatusLabel(status)}
    </Badge>
  );
}

const leaveVariantMap: Record<LeaveRequestStatus, BadgeVariant> = {
  PENDING:  "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export function LeaveStatusBadge({ status }: { status: LeaveRequestStatus }) {
  return (
    <Badge variant={leaveVariantMap[status]}>
      {leaveStatusLabel(status)}
    </Badge>
  );
}

const roleVariantMap: Record<Role, BadgeVariant> = {
  ADMIN:   "danger",
  TEACHER: "info",
  STUDENT: "default",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={roleVariantMap[role]}>
      {roleLabel(role)}
    </Badge>
  );
}
