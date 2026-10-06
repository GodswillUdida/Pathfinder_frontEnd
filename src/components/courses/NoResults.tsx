"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SearchX, PackageOpen, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ===============================
   Types
================================ */

type NoResultsVariant = "no-match" | "empty";

interface NoResultsProps {
  /**
   * "no-match" = filters/search produced zero results (Clear filters CTA).
   * "empty" = there is genuinely nothing in the catalog yet.
   * Auto-inferred from onClearFilters when omitted — pass it explicitly
   * if you need "empty" styling with a clear-filters action still shown.
   */
  variant?: NoResultsVariant;
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  className?: string;
}

interface VariantDefaults {
  icon: LucideIcon;
  title: string;
  description: string;
}

/* ===============================
   Variant copy/iconography
================================ */

const VARIANT_DEFAULTS: Record<NoResultsVariant, VariantDefaults> = {
  "no-match": {
    icon: SearchX,
    title: "No courses match your filters",
    description:
      "Try adjusting your search terms or clearing a filter to see more results.",
  },
  empty: {
    icon: PackageOpen,
    title: "No courses available yet",
    description: "We’re building out the catalog — check back soon for new courses and programs.",
  },
};

/* ===============================
   Component
================================ */

export function NoResults({
  variant,
  title,
  description,
  onClearFilters,
  className,
}: NoResultsProps) {
  const resolvedVariant: NoResultsVariant = variant ?? (onClearFilters ? "no-match" : "empty");
  const defaults = VARIANT_DEFAULTS[resolvedVariant];
  const Icon = defaults.icon;

  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("container mx-auto px-4 py-20 text-center", className)}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/6 bg-indigo-50 dark:border-white/10 dark:bg-indigo-500/10">
          <Icon
            className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>

        <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title ?? defaults.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description ?? defaults.description}
        </p>

        {onClearFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="mt-6 rounded-full"
          >
            Clear filters
          </Button>
        )}
      </div>
    </motion.div>
  );
}