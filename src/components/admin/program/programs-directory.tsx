"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  AlertCircle,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateProgramModal } from "@/components/admin/CreateProgramModal";
import { useDeleteProgram, useProgramList } from "@/hooks/useAdminPrograms";
import {
  ProgramList,
  ListSkeleton,
  type SortDir,
  type SortKey,
} from "./program-list";
import type { Program, ProgramWithCount } from "@/types/domain";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Constants & helpers                                                       */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Name" },
  { key: "courses", label: "Courses" },
];

const PAGE = "mx-auto w-full max-w-6xl pt-[clamp(1rem,2.5vw,2rem)] pb-28";
const BENTO = "grid gap-3 lg:grid-cols-[1.7fr_1fr_1fr]";
const SPRING = { type: "spring" as const, stiffness: 380, damping: 32 };

function getCourseCount(p: ProgramWithCount) {
  return p._count?.courses ?? 0;
}

function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

/** Writes cursor position to CSS variables, so the spotlight costs zero re-renders. */
const spot = (e: ReactPointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/* -------------------------------------------------------------------------- */
/*  CountUp                                                                   */
/* -------------------------------------------------------------------------- */

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => Math.round(v).toString());

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return <motion.span>{text}</motion.span>;
}

/* -------------------------------------------------------------------------- */
/*  Hero card                                                                 */
/* -------------------------------------------------------------------------- */

function Hero({
  total,
  published,
  onCreate,
}: {
  total: number;
  published: number;
  onCreate: () => void;
}) {
  const pct = total === 0 ? 0 : Math.round((published / total) * 100);

  return (
    <div className="sm:mt-0 mt-10 relative isolate flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-800 to-brand-950 p-[clamp(1.25rem,2.5vw,2rem)] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, white 14%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(135deg, black, transparent 70%)",
          WebkitMaskImage: "linear-gradient(135deg, black, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 -z-10 h-64 w-64 rounded-full bg-brand-cyan/30 blur-3xl"
      />

      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-brand-200 uppercase">
          Admin · Academics
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,1.4rem+2vw,3rem)] leading-none font-extrabold tracking-tight">
          Programs
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
          Manage academic programs and the course paths inside them.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        {total > 0 ? (
          <div className="max-w-xs min-w-44 flex-1">
            <div className="mb-2 flex items-center justify-between text-xs text-white/70">
              <span>Published</span>
              <span className="font-semibold text-white tabular-nums">
                {pct}%
              </span>
            </div>
            <div
              role="img"
              aria-label={`${published} of ${total} programs published`}
              className="h-1.5 overflow-hidden rounded-full bg-white/15"
            >
              <div
                style={{ width: `${pct}%` }}
                className="h-full rounded-full bg-brand-cyan transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            </div>
          </div>
        ) : (
          <span />
        )}
        <Button
          onClick={onCreate}
          className="gap-1.5 bg-white text-brand-800 shadow-lg shadow-brand-950/30 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:bg-brand-50 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create program
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stat card (doubles as a status filter)                                    */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  hint,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  hint: string;
  tone: "success" | "warning" | "muted";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      onPointerMove={spot}
      className={cn(
        "group relative isolate flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border p-5 text-left",
        "transition-[border-color,background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:-translate-y-0.5 active:scale-[0.98]",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "before:bg-[radial-gradient(200px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklch,var(--brand-500)_13%,transparent),transparent_70%)]",
        active
          ? "border-primary/50 bg-accent ring-4 ring-ring/10"
          : "border-border bg-card hover:border-brand-300",
      )}
    >
      <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
        <span
          aria-hidden="true"
          className={cn(
            "h-2 w-2 rounded-full",
            tone === "success"
              ? "bg-success"
              : tone
                ? "bg-warning"
                : "bg-muted-foreground",
          )}
        />
        {label}
      </span>
      <span className="mt-6 block">
        <span className="block font-display text-5xl leading-none font-extrabold tracking-tight text-foreground tabular-nums">
          <CountUp value={value} />
        </span>
        <span className="mt-2 block text-xs text-muted-foreground">
          {active ? "Filter on. Click to clear." : hint}
        </span>
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                */
/* -------------------------------------------------------------------------- */

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const iconBtn = "h-8 w-8 rounded-lg";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3 text-[12.5px] text-muted-foreground">
        <span className="tabular-nums">
          {total === 0 ? (
            "No results"
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {from}–{to}
              </span>{" "}
              of <span className="font-semibold text-foreground">{total}</span>
            </>
          )}
        </span>
        <span
          className="hidden h-3.5 w-px bg-border sm:block"
          aria-hidden="true"
        />
        <label className="hidden items-center gap-2 sm:flex">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-input bg-card px-2 text-[12.5px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(iconBtn, "hidden sm:inline-flex")}
          disabled={!canPrev}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={iconBtn}
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <span className="min-w-24 px-2 text-center text-[12.5px] text-muted-foreground tabular-nums md:hidden">
          Page <span className="font-semibold text-foreground">{page}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </span>

        <ul className="hidden items-center gap-0.5 md:flex">
          {pageWindow(page, totalPages).map((p, i) =>
            p === "…" ? (
              <li
                key={`gap-${i}`}
                aria-hidden="true"
                className="px-1.5 text-muted-foreground"
              >
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  className={cn(
                    "h-8 min-w-8 rounded-lg px-2 text-[12.5px] font-medium tabular-nums transition-[background-color,color,transform] duration-200 active:scale-95",
                    p === page
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {p}
                </button>
              </li>
            ),
          )}
        </ul>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className={iconBtn}
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(iconBtn, "hidden sm:inline-flex")}
          disabled={!canNext}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton                                                          */
/* -------------------------------------------------------------------------- */

function PageSkeleton() {
  return (
    <div className={PAGE} aria-busy="true" aria-label="Loading programs">
      <div className={BENTO}>
        <div className="h-56 animate-pulse rounded-3xl bg-muted" />
        <div className="h-40 animate-pulse rounded-3xl bg-muted lg:h-auto" />
        <div className="h-40 animate-pulse rounded-3xl bg-muted lg:h-auto" />
      </div>
      <div className="mt-6 h-10 w-full max-w-sm animate-pulse rounded-xl bg-muted" />
      <div className="mt-4">
        <ListSkeleton />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Directory                                                                 */
/* -------------------------------------------------------------------------- */

export function ProgramsDirectory() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { data, isLoading, error, refetch } = useProgramList();
  const { mutate: deleteProgram, isPending: isDeleting } = useDeleteProgram();

  const programs = useMemo<ProgramWithCount[]>(
    () =>
      (data ?? []).map((program: Program) => ({
        ...program,
        _count: {
          courses:
            (program as { _count?: { courses?: number } })._count?.courses ?? 0,
        },
      })),
    [data],
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "title",
    dir: "asc",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const searchRef = useRef<HTMLInputElement>(null);

  const STATUS_LABELS: Record<"PUBLISHED" | "DRAFT" | "ARCHIVED", string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

  // "/" focuses search, Escape clears it. Ignored while typing or while a dialog is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (
        e.key === "/" &&
        !typing &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isModalOpen &&
        pendingDelete === null
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        setPage(1);
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, pendingDelete]);

  const publishedCount = useMemo(
    () => programs.filter((p) => p.status === "PUBLISHED").length,
    [programs],
  );
  const archivedCount = useMemo(
    () => programs.filter((p) => p.status === "ARCHIVED").length,
    [programs],
  );
  const draftCount = programs.length - publishedCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = programs.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return [...list].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      return sort.key === "title"
        ? a.title.localeCompare(b.title) * dir
        : (getCourseCount(a) - getCourseCount(b)) * dir;
    });
  }, [programs, query, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const pendingProgram = programs.find((p) => p.id === pendingDelete);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    setPage(1);
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));
  };

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected =
    paginated.length > 0 &&
    paginated.every((program) => selected.has(program.id));

  const toggleAll = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allSelected) paginated.forEach((program) => next.delete(program.id));
      else paginated.forEach((program) => next.add(program.id));
      return next;
    });
  };

  const runDelete = () => {
    if (!pendingDelete) return;
    deleteProgram(pendingDelete, {
      onSuccess: () => {
        refetch();
        toast.success("Program deleted");
        setPendingDelete(null);
      },
      onError: () => {
        toast.error("Couldn't delete that program. Try again.");
        setPendingDelete(null);
      },
    });
  };

  const reveal = (i = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            type: "spring" as const,
            stiffness: 140,
            damping: 20,
            delay: i * 0.07,
          },
        };

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (isLoading) return <PageSkeleton />;

  /* ── Error ───────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className={cn(PAGE, "max-w-3xl space-y-4")}>
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-[13px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">
              We couldn&rsquo;t load your programs
            </p>
            <p className="mt-0.5 opacity-90">
              {(error as Error).message ?? "Failed to load programs."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 shadow-sm shadow-primary/25"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create program
          </Button>
        </div>
        <CreateProgramModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />
      </div>
    );
  }

  const hasPrograms = programs.length > 0;

  /* ── Main ────────────────────────────────────────────────────────────── */
  return (
    <div className={PAGE}>
      {/* Bento header */}
      <div className={hasPrograms ? BENTO : "grid gap-3"}>
        <motion.div {...reveal(0)}>
          <Hero
            total={programs.length}
            published={publishedCount}
            onCreate={() => setIsModalOpen(true)}
          />
        </motion.div>

        {hasPrograms && (
          <>
            <motion.div {...reveal(1)}>
              <StatCard
                label="Published"
                tone="success"
                value={publishedCount}
                hint="Live and visible to students"
                active={statusFilter === "PUBLISHED"}
                onClick={() =>
                  handleStatusFilterChange(
                    statusFilter === "PUBLISHED" ? "ALL" : "PUBLISHED",
                  )
                }
              />
            </motion.div>
            <motion.div {...reveal(2)}>
              <StatCard
                label="Draft"
                tone="warning"
                value={draftCount}
                hint="Still being prepared"
                active={statusFilter === "DRAFT"}
                onClick={() =>
                  handleStatusFilterChange(
                    statusFilter === "DRAFT" ? "ALL" : "DRAFT",
                  )
                }
              />
            </motion.div>
            <motion.div {...reveal(3)}>
              <StatCard
                label="Archived"
                tone="muted"
                value={archivedCount}
                hint="Hidden from students"
                active={statusFilter === "ARCHIVED"}
                onClick={() =>
                  handleStatusFilterChange(
                    statusFilter === "ARCHIVED" ? "ALL" : "ARCHIVED",
                  )
                }
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Toolbar */}
      {hasPrograms && (
        <motion.div
          {...reveal(3)}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search programs…"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              aria-label="Search programs"
              className="h-10 w-full rounded-xl border border-input bg-card pr-10 pl-10 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
              >
                /
              </kbd>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {statusFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => handleStatusFilterChange("ALL")}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-primary/30 bg-accent px-3 text-[12.5px] font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
              >
                {STATUS_LABELS[statusFilter]}
                <X className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Clear status filter</span>
              </button>
            )}
            <LayoutGroup id="program-sort">
              <div
                role="group"
                aria-label="Sort programs"
                className="flex h-10 items-center rounded-xl border border-border bg-secondary p-0.5"
              >
                {SORTS.map(({ key, label }) => {
                  const on = sort.key === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleSort(key)}
                      className={cn(
                        "relative h-full rounded-[10px] px-3.5 text-[12.5px] font-medium transition-colors duration-200",
                        on
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="sort-pill"
                          transition={reduce ? { duration: 0 } : SPRING}
                          className="absolute inset-0 rounded-[10px] bg-card shadow-sm ring-1 ring-border"
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {label}
                        {on && (
                          <ArrowUp
                            aria-label={
                              sort.dir === "asc" ? "ascending" : "descending"
                            }
                            className={cn(
                              "h-3 w-3 text-primary transition-transform duration-300",
                              sort.dir === "desc" && "rotate-180",
                            )}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>
        </motion.div>
      )}

      {/* List */}
      <motion.div {...reveal(4)} className="mt-4">
        <ProgramList
          programs={paginated}
          query={query}
          sort={sort}
          onSort={toggleSort}
          selected={selected}
          allSelected={allSelected}
          onToggleRow={toggleSelect}
          onToggleAll={toggleAll}
          onOpen={(id) => router.push(`/admin/programs/${id}`)}
          onDelete={(id) => setPendingDelete(id)}
          onCreate={() => setIsModalOpen(true)}
          isFiltered={query.trim() !== "" || statusFilter !== "ALL"}
          onClearFilters={() => {
            setQuery("");
            setStatusFilter("ALL");
            setPage(1);
          }}
        />

        {filtered.length > 0 && (
          <div className="mt-3">
            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Floating selection bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={SPRING}
            className="premium-blur-glass fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-2.5 shadow-2xl shadow-brand-950/20"
          >
            <span className="grid h-6 min-w-6 place-items-center rounded-lg bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums">
              {selected.size}
            </span>
            <span className="text-[13px] font-medium text-foreground">
              selected
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg px-2.5 py-1 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingProgram
                ? `Delete “${pendingProgram.title}”?`
                : "Delete this program?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This can&rsquo;t be undone. Courses inside will lose their program
              association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={runDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateProgramModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
