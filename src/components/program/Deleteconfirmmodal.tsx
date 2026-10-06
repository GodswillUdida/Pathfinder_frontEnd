"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDeleteCourse } from "@/hooks/useCourses";
import { toast } from "sonner";

interface DeleteConfirmModalProps {
  open: boolean;
  courseName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteConfirmModal({
  open, courseName, onConfirm, onClose,
}: DeleteConfirmModalProps) {
  // const deleteCourse = useDeleteCourse();
  const deleteCourse = useDeleteCourse();
  const deleting = deleteCourse.isPending;

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
    try {
      await onConfirm();
      toast.success(`Course "${courseName}" deleted.`);
      // onClose();
    } catch (error) {
      console.error("Failed to delete course.", error);
      toast.error("Failed to delete course. Please try again.");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={() => !deleting && onClose()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        className="fixed inset-x-4 bottom-4 z-61 mx-auto max-w-sm rounded-3xl p-6
                   sm:inset-0 sm:m-auto sm:w-full sm:h-fit
                   bg-white dark:bg-[#1a1c24]
                   shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35)]
                   animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" aria-hidden="true" />
          </div>
        </div>

        <h3
          id="delete-title"
          className="text-center text-[15px] font-bold text-gray-900 dark:text-white"
        >
          Delete course?
        </h3>
        <p
          id="delete-desc"
          className="mt-2 text-center text-[13px] leading-relaxed text-gray-500 dark:text-white/50"
        >
          <span className="font-semibold text-gray-900 dark:text-white">
            &quot;{courseName}&quot;
          </span>{" "}
          will be permanently deleted. This cannot be undone.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => !deleting && onClose()}
            disabled={deleting}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-gray-700 dark:text-white/70
                       border border-gray-200 dark:border-white/8
                       transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-white/6
                       disabled:opacity-40 cursor-pointer
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white
                       bg-red-500 hover:bg-red-600
                       transition-colors duration-150 active:scale-[0.98]
                       disabled:opacity-60 cursor-pointer
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
          >
            {deleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              "Yes, delete"
            )}
          </button>
        </div>
      </div>
    </>
  );
}