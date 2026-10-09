"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldHeader } from "../ui/FieldHeader";

interface PositionFieldProps {
  /** 1-based display position. */
  value: number;
  max: number;
  topics: { id: string; title: string }[];
  onChange: (n: number) => void;
  disabled?: boolean;
}

const stepButton =
  "grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors duration-200 active:scale-95 hover:border-brand-300 hover:bg-secondary disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const chip =
  "h-9 rounded-full border border-border px-3.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

export function PositionField({ value, max, topics, onChange, disabled }: PositionFieldProps) {
  const placement =
    value <= 1
      ? "Will be the first topic in this module"
      : `Will sit right after “${topics[value - 2]?.title ?? "the previous topic"}”`;

  return (
    <div className="space-y-2.5">
      <FieldHeader index="04" label="Position" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Move earlier"
            disabled={disabled || value <= 1}
            onClick={() => onChange(value - 1)}
            className={stepButton}
          >
            <Minus className="h-4 w-4" />
          </button>
          <output
            aria-live="polite"
            className="grid h-11 min-w-14 place-items-center rounded-xl bg-secondary px-3 font-mono text-[15px] font-bold tabular-nums text-foreground"
          >
            {String(value).padStart(2, "0")}
          </output>
          <button
            type="button"
            aria-label="Move later"
            disabled={disabled || value >= max}
            onClick={() => onChange(value + 1)}
            className={stepButton}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || value === 1}
            onClick={() => onChange(1)}
            className={chip}
          >
            First
          </button>
          <button
            type="button"
            disabled={disabled || value === max}
            onClick={() => onChange(max)}
            className={cn(chip)}
          >
            Last
          </button>
        </div>
      </div>

      <p className="text-[12px] text-muted-foreground">
        {placement}
        <span className="text-muted-foreground/60">
          {" "}
          (position {value} of {max})
        </span>
      </p>
    </div>
  );
}
