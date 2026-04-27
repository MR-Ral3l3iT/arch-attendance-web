import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, "id">) => string;
  remove: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    set((s) => ({ toasts: [...s.toasts.slice(-4), { ...toast, id }] }));
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

// Call these anywhere — inside or outside React components
export const toast = {
  success: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().add({ type: "success", message, title, duration }),
  error: (message: string, title?: string, duration = 6000) =>
    useToastStore.getState().add({ type: "error", message, title, duration }),
  warning: (message: string, title?: string, duration = 5000) =>
    useToastStore.getState().add({ type: "warning", message, title, duration }),
  info: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().add({ type: "info", message, title, duration }),
};
