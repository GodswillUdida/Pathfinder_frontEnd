"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  open:       boolean;
  courseName: string;
  onConfirm:  () => Promise<void>;
  onClose:    () => void;
}

export function DeleteConfirmModal({
  open, courseName, onConfirm, onClose,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleting, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try { await onConfirm(); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
        aria-hidden="true"
        onClick={() => !deleting && onClose()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        className="fixed inset-x-4 bottom-4 z-[61] mx-auto max-w-sm rounded-3xl p-6
                   sm:inset-0 sm:m-auto sm:w-full sm:h-fit
                   animate-in fade-in zoom-in-95 duration-150"
        style={{ background: "#fff", boxShadow: "0 24px 64px -12px rgba(0,0,0,0.35)" }}
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "rgba(239,68,68,0.08)" }}
          >
            <AlertTriangle className="h-6 w-6" style={{ color: "#ef4444" }} />
          </div>
        </div>

        <h3
          id="delete-title"
          className="text-center text-[15px] font-bold"
          style={{ color: "#0f172a" }}
        >
          Delete course?
        </h3>
        <p
          id="delete-desc"
          className="mt-2 text-center text-[13px] leading-relaxed"
          style={{ color: "#64748b" }}
        >
          <span className="font-semibold" style={{ color: "#0f172a" }}>"{courseName}"</span>{" "}
          will be permanently deleted. This cannot be undone.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => !deleting && onClose()}
            disabled={deleting}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors hover:bg-gray-100 disabled:opacity-40"
            style={{ border: "1px solid #e5e7eb", color: "#374151" }}
          >
            Keep course
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "#ef4444" }}
          >
            {deleting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Deleting…</>
            ) : (
              "Yes, delete"
            )}
          </button>
        </div>
      </div>
    </>
  );
}