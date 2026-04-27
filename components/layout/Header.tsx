"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { Avatar } from "@/components/ui";
import api from "@/lib/api";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      logout();
      toast.info("ออกจากระบบเรียบร้อยแล้ว");
      router.push("/login");
    }
  }

  const displayName =
    mounted && user
      ? [user.firstName, user.lastName].filter((s) => s?.trim()).join(" ").trim() ||
        user.username?.trim() ||
        user.email?.trim() ||
        "ผู้ใช้"
      : "";

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 gap-4">
      {title && (
        <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
      )}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <button
          type="button"
          className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="การแจ้งเตือน"
        >
          <Bell size={18} />
        </button>

        {mounted && user && (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={displayName} size="sm" />
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[10rem] sm:max-w-[14rem]">
                {displayName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
              className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
