"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useCreateCourse } from "@/hooks/useCourses";
import type { CoursePayload } from "@/hooks/useCourses";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */

const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  slug: z.string().max(100).optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  schedule: z.string().optional(),
  tags: z.string().optional(), // comma separated
});

type CourseForm = z.infer<typeof courseSchema>;

type CreateCourseModalProps = {
  open: boolean;
  onClose: () => void;
  programId: string;
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export function CreateCourseModal({
  open,
  onClose,
  programId,
}: CreateCourseModalProps) {

  const { mutateAsync, isPending } = useCreateCourse();

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: CourseForm) => {
    if (thumbnailFile && thumbnailUrl) {
      toast.error("Choose either a file or a URL, not both");
      return;
    }

    const payload: CoursePayload = {
      programId,
      type: "physical",

      title: data.title,
      description: data.description,
      slug: data.slug,
      level: data.level,
      duration: data.duration,
      category: data.category,
      location: data.location,
      schedule: data.schedule,

      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,

      thumbnail: thumbnailFile ?? (thumbnailUrl || undefined),
    };

    try {
      await mutateAsync(payload);

      toast.success("Course created successfully");

      reset();
      setThumbnailFile(null);
      setThumbnailUrl("");
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create course"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Physical Course</DialogTitle>
          <DialogDescription>
            Add a new physical course to this program.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto space-y-4"
        >
          <Field label="Title *" error={errors.title?.message}>
            <Input {...register("title")} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Textarea {...register("description")} />
          </Field>

          <Field label="Level">
            <Input {...register("level")} />
          </Field>

          <Field label="Duration">
            <Input {...register("duration")} />
          </Field>

          <Field label="Category">
            <Input {...register("category")} />
          </Field>

          <Field label="Location">
            <Input {...register("location")} />
          </Field>

          <Field label="Schedule">
            <Input {...register("schedule")} />
          </Field>

          <Field label="Tags (comma separated)">
            <Input {...register("tags")} />
          </Field>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Thumbnail</Label>

            <Input
              type="file"
              accept="image/*"
              disabled={Boolean(thumbnailUrl)}
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />

            <Input
              placeholder="Or image URL"
              value={thumbnailUrl}
              disabled={Boolean(thumbnailFile)}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />

            <p className="text-xs text-muted-foreground">
              Upload an image or provide a URL (one only).
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   FIELD                                    */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
