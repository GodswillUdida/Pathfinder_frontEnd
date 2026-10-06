"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { AlertCircle, ImageIcon, Loader2, Upload, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUpdateProgram } from "@/hooks/useAdminPrograms";
import type { Program } from "@/types/domain";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  image: z.union([z.instanceof(File), z.string().url("Must be a valid URL"), z.literal("")]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditProgramSheetProps {
  program: Program & { image?: string | null };
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const fieldLabel = "text-[12px] font-semibold text-foreground";
const errorText = "flex items-center gap-1 text-[11px] font-medium text-destructive";

export function EditProgramSheet({ program, open, onClose, onSaved }: EditProgramSheetProps) {
  const { mutateAsync: updateProgram, isPending } = useUpdateProgram();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: program.title,
      description: program.description ?? "",
      image: program.image ?? "",
    },
  });

  const imageValue = useWatch({ control, name: "image" });

  // Create one object URL per locally-picked file and revoke it when it changes.
  const objectUrl = useMemo(
    () => (imageValue instanceof File ? URL.createObjectURL(imageValue) : null),
    [imageValue],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewSrc = useMemo(() => {
    if (imageValue instanceof File) return objectUrl;
    if (typeof imageValue === "string" && imageValue) return imageValue;
    return null;
  }, [imageValue, objectUrl]);

  useEffect(() => {
    if (!open) return;
    reset({
      title: program.title,
      description: program.description ?? "",
      image: program.image ?? "",
    });
  }, [open, program, reset]);

  const clearImage = () => {
    setValue("image", "", { shouldDirty: true });
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (data: FormValues) => {
    if (isPending) return;

    try {
      if (data.image instanceof File) {
        const formData = new FormData();
        formData.append("title", data.title);
        if (data.description) formData.append("description", data.description);
        formData.append("image", data.image);
        // The hook accepts FormData for uploads or a plain object otherwise; both paths share this call.
        await updateProgram({
          programId: program.id,
          data: formData as unknown as Parameters<typeof updateProgram>[0]["data"],
        });
      } else {
        await updateProgram({
          programId: program.id,
          data: {
            title: data.title,
            description: data.description || undefined,
            image: data.image || undefined,
          },
        });
      }

      toast.success("Program updated");
      onSaved();
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update program.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && !isPending && onClose()}>
      <SheetContent side="right" className="flex w-full px-4 flex-col gap-0 sm:max-w-lg">
        <SheetHeader className="space-y-1 border-b border-border pb-4">
          <SheetTitle className="font-display text-lg font-bold tracking-tight">
            Edit program
          </SheetTitle>
          <SheetDescription className="text-[13px]">
            Update title, description and cover image.
          </SheetDescription>
        </SheetHeader>

        <form
          id="edit-program-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col gap-5 overflow-y-auto py-5"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className={fieldLabel}>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-title"
              {...register("title")}
              aria-invalid={!!errors.title}
              className={cn(
                "rounded-md",
                errors.title && "border-destructive focus-visible:ring-destructive/80",
              )}
            />
            {errors.title && (
              <p role="alert" className={errorText}>
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className={fieldLabel}>
              Description
            </Label>
            <Textarea
              id="edit-description"
              rows={4}
              {...register("description")}
              aria-invalid={!!errors.description}
              className="resize-none rounded-xl"
            />
            {errors.description && (
              <p role="alert" className={errorText}>
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Cover image */}
          <div className="space-y-2">
            <Label className={fieldLabel}>Cover image</Label>

            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith("image/")) field.onChange(file);
                    }}
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 text-center transition-colors duration-200",
                      dragging
                        ? "border-primary bg-accent"
                        : "border-border hover:border-brand-300 hover:bg-accent/40",
                    )}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                      <Upload className="h-[18px] w-[18px]" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">
                        Drop an image here or click to browse
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        PNG, JPG, WEBP — max 1 MB
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) field.onChange(file);
                    }}
                  />

                  <Input
                    placeholder="Or paste an image URL…"
                    value={typeof field.value === "string" ? field.value : ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="rounded-xl text-[13px]"
                  />
                </>
              )}
            />

            {errors.image && (
              <p role="alert" className={errorText}>
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.image.message as string}
              </p>
            )}

            {previewSrc ? (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <div className="relative aspect-video w-full bg-secondary">
                  <Image
                    src={previewSrc}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    unoptimized={imageValue instanceof File}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  aria-label="Remove image"
                  className="absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-brand-950/70 text-white backdrop-blur-sm transition-colors hover:bg-brand-950"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">
                <ImageIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
                No cover image set
              </div>
            )}
          </div>
        </form>

        <SheetFooter className="gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1 rounded-xl sm:flex-none">
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-program-form"
            disabled={isPending || !isDirty}
            className="flex-1 gap-1.5 rounded-xl shadow-sm shadow-primary/25 sm:flex-none"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}