"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Layers } from "lucide-react";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemActionsMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg text-gray-400 dark:text-white/35 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-gray-700 dark:hover:text-white/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        aria-label="Item actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#12141b] shadow-lg py-1 z-20">
          <button
            role="menuitem"
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.06] cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" /> Edit
          </button>
          <div className="my-1 border-t border-black/[0.06] dark:border-white/[0.06]" />
          <button
            role="menuitem"
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}