import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "title"> {
  label: string;
  variant?: "default" | "danger";
}

/** 44px touch target on mobile, 36px from `sm` up. */
export function IconButton({
  label,
  variant = "default",
  type = "button",
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-9 sm:w-9",
        "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-30",
        "active:scale-90",
        variant === "danger"
          ? "text-muted-foreground hover:scale-105 hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:scale-105 hover:bg-secondary hover:text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
