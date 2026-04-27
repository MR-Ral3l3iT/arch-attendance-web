"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

export function parseApiError(err: unknown): string {
  const msg =
    (err as AxiosError<ApiError>)?.response?.data?.message ?? "เกิดข้อผิดพลาด";
  return Array.isArray(msg) ? msg.join(", ") : String(msg);
}

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const { data: result } = await api.get<T>(url);
      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) setError(parseApiError(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { data, loading, error, refetch: load };
}
