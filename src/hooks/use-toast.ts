"use client";

import { toast as sonner } from "sonner";

type ToastVariant = "default" | "destructive" | "success";

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
    duration = 4000,
  }: ToastProps) => {
    switch (variant) {
      case "success":
        sonner.success(title, { description, duration });
        break;
      case "destructive":
        sonner.error(title, { description, duration });
        break;
      default:
        sonner(title, { description, duration });
    }
  };

  return { toast };
};
