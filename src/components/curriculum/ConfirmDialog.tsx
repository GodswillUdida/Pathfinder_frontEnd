"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, description, confirmLabel = "Confirm", isConfirming, onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isConfirming) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isConfirming, onCancel]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={() => !isConfirming && onCancel()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="fixed inset-x-4 bottom-4 z-61 mx-auto max-w-sm rounded-3xl p-6 sm:inset-0 sm:m-auto sm:w-full sm:h-fit bg-white dark:bg-[#1a1c24] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" aria-hidden="true" />
          </div>
        </div>
        <h3 id="confirm-title" className="text-center text-[15px] font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p id="confirm-desc" className="mt-2 text-center text-[13px] leading-relaxed text-gray-500 dark:text-white/50">
          {description}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => !isConfirming && onCancel()}
            disabled={isConfirming}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-gray-700 dark:text-white/70 border border-gray-200 dark:border-white/8 transition-colors hover:bg-gray-100 dark:hover:bg-white/6 disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13 px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors active:scale-[0.98] disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
          >
            {isConfirming ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Deleting…</>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}