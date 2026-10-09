"use client";

import { forwardRef } from "react";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

interface ProgramToolbarProps {
  query: string;
  onQueryChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  counts: { all: number; published: number; draft: number };
  onExport: () => void;
  exportDisabled: boolean;
}

export const ProgramToolbar = forwardRef<HTMLInputElement, ProgramToolbarProps>(function ProgramToolbar(
  { query, onQueryChange, statusFilter, onStatusFilterChange, counts, onExport, exportDisabled },
  searchRef
) {
  const filters: [StatusFilter, string][] = [
    ["ALL", `All ${counts.all}`],
    ["PUBLISHED", `Published ${counts.published}`],
    ["DRAFT", `Draft ${counts.draft}`],
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full gap-2 sm:max-w-xs">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={searchRef}
            type="search"
            placeholder="Search programs…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search programs"
            className="pl-9 pr-9 text-[12.5px]"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[9.5px] text-muted-foreground">
            /
          </kbd>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onExport}
          disabled={exportDisabled}
          aria-label="Export visible programs as CSV"
          className="shrink-0 cursor-pointer duration-300 ease-in-out"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="inline-flex w-fit items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
        {filters.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusFilterChange(value)}
            className={cn(
              "rounded-md px-2.5 py-1.5 font-mono text-[11px] font-medium tabular-nums transition-colors cursor-pointer duration-300 ease-in-out",
              statusFilter === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});