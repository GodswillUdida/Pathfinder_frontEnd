"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TABS, panelId, tabId } from "./constants";
import type { WorkspaceTab } from "./types";

interface TabBarProps {
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
}

/**
 * WAI-ARIA tabs: roving tabindex, Arrow/Home/End keys, and the active tab
 * scrolls into view on narrow screens. Automatic activation (focus = select).
 */
export function TabBar({ active, onChange }: TabBarProps) {
  const reduce = useReducedMotion();
  const refs = useRef<Partial<Record<WorkspaceTab, HTMLButtonElement | null>>>({});

  useEffect(() => {
    refs.current[active]?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active, reduce]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = TABS.findIndex((t) => t.key === active);
    let next = current;

    switch (e.key) {
      case "ArrowRight":
        next = (current + 1) % TABS.length;
        break;
      case "ArrowLeft":
        next = (current - 1 + TABS.length) % TABS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = TABS.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const key = TABS[next].key;
    onChange(key);
    refs.current[key]?.focus();
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent sm:hidden"
      />
      <div
        role="tablist"
        aria-label="Course sections"
        onKeyDown={onKeyDown}
        className="hide-scrollbar flex w-full items-stretch overflow-x-auto border-b border-border/50 bg-background/50 backdrop-blur-sm sm:rounded-2xl"
      >
        {TABS.map((tab, i) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                refs.current[tab.key] = el;
              }}
              id={tabId(tab.key)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(tab.key)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative flex min-h-12 min-w-26 flex-1 cursor-pointer items-center justify-center gap-2.5",
                "px-4 py-3.5 text-[13px] font-semibold tracking-tight whitespace-nowrap",
                "transition-colors duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "font-mono text-[12.5px] tabular-nums transition-colors duration-300",
                  isActive ? "text-brand-amber" : "text-muted-foreground/50",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="course-tab-underline"
                  transition={
                    reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
                  }
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-amber"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
