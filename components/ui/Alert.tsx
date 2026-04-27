import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "warning" | "danger" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const config: Record<
  AlertVariant,
  { icon: React.ElementType; classes: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    classes: "bg-success/8 border-success/20 text-success-700",
    iconClass: "text-success",
  },
  warning: {
    icon: TriangleAlert,
    classes: "bg-warning/8 border-warning/20 text-warning-700",
    iconClass: "text-warning",
  },
  danger: {
    icon: AlertCircle,
    classes: "bg-danger/8 border-danger/20 text-danger-700",
    iconClass: "text-danger",
  },
  info: {
    icon: Info,
    classes: "bg-info/8 border-info/20 text-info-700",
    iconClass: "text-info",
  },
};

export function Alert({ variant = "info", title, children, className, onClose }: AlertProps) {
  const { icon: Icon, classes, iconClass } = config[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        classes,
        className
      )}
    >
      <Icon size={18} className={cn("shrink-0 mt-0.5", iconClass)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
