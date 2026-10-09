"use client";

import { useEffect, useState } from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

export interface KebabItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

export function KebabMenu({ items }: { items: KebabItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <IconButton
        label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreVertical className="h-4 w-4" />
      </IconButton>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className={cn(
              "absolute top-full right-0 z-20 mt-2 w-52 origin-top-right",
              "rounded-2xl border border-border bg-popover/95 py-1.5 backdrop-blur-xl",
              "shadow-[0_20px_40px_-12px] shadow-black/40",
              "animate-in fade-in zoom-in-95 duration-200",
            )}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px]",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  item.danger
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-popover-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
