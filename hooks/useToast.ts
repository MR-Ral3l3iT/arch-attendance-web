"use client";

import { toast } from "@/store/toast.store";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

export { toast };

// Convenience hook for handling API errors with toast
export function useApiError() {
  const handleError = (error: unknown, fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่") => {
    const axiosErr = error as AxiosError<ApiError>;
    const message =
      axiosErr?.response?.data?.message ?? axiosErr?.message ?? fallback;
    toast.error(Array.isArray(message) ? message.join(", ") : message);
  };

  return { handleError };
}
