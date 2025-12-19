/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateCourse, CoursePayload } from "@/hooks/useCourses";
import { useAuthStore } from "@/store/userStore";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  slug: z.string().max(100, "Slug too long").optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  schedule: z.string().optional(),
});

type CourseForm = z.infer<typeof courseSchema>;

type CreateCourseModalProps = {
  open: boolean;
  onClose: () => void;
  programId: string;
};

export function CreateCourseModal({
  open,
  onClose,
  programId,
}: CreateCourseModalProps) {
  const { mutateAsync, isPending } = useCreateCourse();
  const tokenFromState = useAuthStore((state) => state.token);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: CourseForm) => {
    if (!tokenFromState && !localStorage.getItem("token")) {
      toast.error("You are not logged in. Please login to continue.");
      return;
    }

    // Use local file if available, otherwise URL
    let thumbnail: string | File | undefined = undefined;
    if (thumbnailFile) {
      thumbnail = thumbnailFile; // Your hook can handle File uploads
    } else if (thumbnailUrl) {
      thumbnail = thumbnailUrl;
    }

    const payload: CoursePayload = {
      programId,
      title: data.title,
      description: data.description || undefined,
      thumbnail: thumbnail as any,
      type: "physical",
      slug: data.slug || undefined,
      level: data.level || undefined,
      duration: data.duration || undefined,
      tags: data.tags?.split(",").map((t) => t.trim()),
      category: data.category || undefined,
      location: data.location || undefined,
      schedule: data.schedule || undefined,
    };

    try {
      await mutateAsync(payload);
      toast.success("Course created successfully");
      reset();
      setThumbnailFile(null);
      setThumbnailUrl("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Create Physical Course
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new physical course to your program.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex-1 overflow-y-auto pr-1 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-red-500 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
            <Input
              placeholder="Or enter image URL"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You can either upload a local file or provide an image URL.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
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
