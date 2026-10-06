"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateProgram } from "@/hooks/useAdminPrograms";

const programSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or fewer"),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional(),
});

type ProgramForm = z.infer<typeof programSchema>;

interface CreateProgramModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProgramModal({ open, onClose, onCreated }: CreateProgramModalProps) {
  const { mutateAsync, isPending } = useCreateProgram();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ProgramForm>({
    resolver: zodResolver(programSchema),
    defaultValues: { title: "", description: "" },
  });

  const descriptionValue = useWatch({ control, name: "description", defaultValue: "" }) ?? "";
  const { ref: titleRegisterRef, ...titleRegister } = register("title");

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  const onSubmit = async (data: ProgramForm) => {
    try {
      await mutateAsync(data);
      toast.success("Program created.");
      reset();
      onCreated();
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Failed to create program.";
      toast.error(
        msg.includes("401") || msg.includes("Authorization") ? "Session expired. Please sign in again." : msg
      );
    }
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-amber-50 dark:bg-amber-500/10">
              <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <DialogTitle className="text-[14px]">New program</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[12px]">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Accounting Technician Scheme"
              {...titleRegister}
              ref={(el) => {
                titleRegisterRef(el);
                (firstFieldRef as React.RefObject<HTMLInputElement | null>).current = el;
              }}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={errors.title ? "border-destructive focus-visible:ring-destructive/30" : undefined}
            />
            {errors.title && (
              <p id="title-error" role="alert" className="text-[11px] text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[12px]">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="A short summary of what this program covers…"
              {...register("description")}
              aria-invalid={!!errors.description}
              className={errors.description ? "border-destructive focus-visible:ring-destructive/30" : undefined}
            />
            {errors.description ? (
              <p role="alert" className="text-[11px] text-destructive">{errors.description.message}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground" aria-live="polite">
                {descriptionValue.length}/500 characters
              </p>
            )}
          </div>

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <GraduationCap className="h-3.5 w-3.5" /> Create program
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}