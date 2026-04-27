"use client";

import { useEffect } from "react";
import { ToastContainer } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/auth.store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
