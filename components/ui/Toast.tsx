"use client";

import { create } from "zustand";
import ChakliSpiral from "@/components/svg/ChakliSpiral";

interface ToastItem {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, action?: ToastItem["action"]) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, action) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, action }] }));
    setTimeout(() => get().dismiss(id), 3000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 flex-col items-center gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-paan-700 px-5 py-3.5 text-pista-100 shadow-[var(--shadow-dark)]"
        >
          <ChakliSpiral className="h-5 w-5 shrink-0 text-kesariya-500" strokeWidth={8} />
          <p className="flex-1 text-[15px] font-medium">{t.message}</p>
          {t.action ? (
            <button
              type="button"
              className="shrink-0 text-[15px] font-bold text-kesariya-500 hover:text-kesariya-300"
              onClick={() => {
                t.action?.onClick();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
