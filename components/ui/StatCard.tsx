import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  className?: string;
  accent?: "primary" | "success" | "warning" | "danger" | "info";
}

const accentBorder: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  danger:  "border-l-danger",
  info:    "border-l-info",
};

const accentIcon: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
  info:    "bg-info/10 text-info",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  accent,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-card p-5",
        accent && `border-l-4 ${accentBorder[accent]}`,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium mt-1",
                trend.value >= 0 ? "text-success" : "text-danger"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%{trend.label && ` ${trend.label}`}
            </p>
          )}
        </div>
        {icon && accent && (
          <div className={cn("p-2.5 rounded-xl shrink-0", accentIcon[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
