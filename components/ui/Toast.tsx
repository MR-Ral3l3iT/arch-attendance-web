"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, TriangleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore, type ToastItem, type ToastType } from "@/store/toast.store";

const config: Record<
  ToastType,
  { icon: React.ElementType; bar: string; iconClass: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    bar: "bg-success",
    iconClass: "text-success",
    bg: "bg-white border-l-4 border-l-success",
  },
  error: {
    icon: AlertCircle,
    bar: "bg-danger",
    iconClass: "text-danger",
    bg: "bg-white border-l-4 border-l-danger",
  },
  warning: {
    icon: TriangleAlert,
    bar: "bg-warning",
    iconClass: "text-warning",
    bg: "bg-white border-l-4 border-l-warning",
  },
  info: {
    icon: Info,
    bar: "bg-info",
    iconClass: "text-info",
    bg: "bg-white border-l-4 border-l-info",
  },
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const remove = useToastStore((s) => s.remove);
  const { icon: Icon, iconClass, bg } = config[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => remove(toast.id), toast.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, remove]);

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 w-80 rounded-xl shadow-card-md px-4 py-3",
        "animate-in slide-in-from-right-5 fade-in duration-300",
        bg
      )}
    >
      <Icon size={18} className={cn("shrink-0 mt-0.5", iconClass)} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm text-gray-600 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
        aria-label="ปิด"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR + first client paint must match (null); portal only after mount to avoid hydration mismatch.
  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} />
        </div>
      ))}
    </div>,
    document.body
  );
}
