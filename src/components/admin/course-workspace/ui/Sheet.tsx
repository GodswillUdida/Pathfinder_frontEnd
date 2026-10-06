"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

/**
 * Bottom sheet on mobile, centered dialog from `sm` up.
 *
 * - Portaled to <body>, so no ancestor overflow/transform can clip it.
 * - Focus moves in on open (title field on desktop, the panel on touch so
 *   the keyboard doesn't cover the sheet), is trapped, and returns to the
 *   trigger on close.
 * - Escape / backdrop / swipe-down all call `onRequestClose`; the parent
 *   decides whether to confirm (unsaved work) or ignore (upload running).
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

const SheetContext = createContext<{
  startDrag: (e: ReactPointerEvent) => void;
} | null>(null);

interface SheetProps {
  open: boolean;
  onRequestClose: () => void;
  /** id of the element that titles the dialog (see SheetHeader `titleId`). */
  labelledBy: string;
  /** false while work is in flight: Escape, backdrop and swipe are ignored. */
  dismissible?: boolean;
  /** Fired on Cmd/Ctrl+Enter anywhere inside the sheet. */
  onSubmitShortcut?: () => void;
  children: ReactNode;
}

export function Sheet({
  open,
  onRequestClose,
  labelledBy,
  dismissible = true,
  onSubmitShortcut,
  children,
}: SheetProps) {
  const isClient = useIsClient();
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Latest callbacks without re-running the open/close effect.
  const latest = useRef({ onRequestClose, dismissible });
  useEffect(() => {
    latest.current = { onRequestClose, dismissible };
  });

  useEffect(() => {
    if (!open) return;

    restoreRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && latest.current.dismissible) {
        e.preventDefault();
        latest.current.onRequestClose();
      }
    };
    document.addEventListener("keydown", onKey);

    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const target = coarse
        ? panel
        : (panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel);
      target.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const ctx = useMemo(
    () => ({
      startDrag: (e: ReactPointerEvent) => {
        if (latest.current.dismissible) controls.start(e);
      },
    }),
    [controls],
  );

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && onSubmitShortcut) {
      e.preventDefault();
      onSubmitShortcut();
      return;
    }
    if (e.key !== "Tab") return;

    const panel = panelRef.current;
    const nodes = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      : [];
    if (nodes.length === 0) {
      e.preventDefault();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (
      latest.current.dismissible &&
      (info.offset.y > 120 || info.velocity.y > 600)
    ) {
      latest.current.onRequestClose();
    }
  };

  if (!isClient) return null;

  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 36 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          key="sheet"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={() => {
              if (dismissible) onRequestClose();
            }}
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
          />

          <SheetContext.Provider value={ctx}>
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              tabIndex={-1}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={spring}
              drag="y"
              dragControls={controls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={onDragEnd}
              onKeyDown={onKeyDown}
              className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl outline-none sm:max-w-lg sm:rounded-3xl"
            >
              {children}
            </motion.div>
          </SheetContext.Provider>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function SheetHeader({
  eyebrow,
  title,
  titleId,
  onClose,
  closeDisabled,
}: {
  eyebrow?: string;
  title: string;
  titleId: string;
  onClose: () => void;
  closeDisabled?: boolean;
}) {
  const ctx = useContext(SheetContext);
  return (
    <div className="shrink-0 border-b border-border">
      {/* Swipe handle: mobile only */}
      <div
        aria-hidden="true"
        onPointerDown={ctx?.startDrag}
        className="flex touch-none justify-center pt-2.5 pb-1 sm:hidden"
      >
        <span className="h-1 w-10 rounded-full bg-border" />
      </div>
      <div className="flex items-start justify-between gap-3 px-5 pt-2 pb-3.5 sm:pt-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[12px] font-medium text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h3
            id={titleId}
            className="font-display text-[1.2rem] leading-tight font-bold tracking-tight text-foreground"
          >
            {title}
          </h3>
        </div>
        <IconButton label="Close" onClick={onClose} disabled={closeDisabled}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}

export function SheetBody({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
      {children}
    </div>
  );
}

export function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-border bg-background px-5 pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}
