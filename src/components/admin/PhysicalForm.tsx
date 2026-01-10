"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  physicalCourseSchema,
  PhysicalCourseInput,
  CourseLevel,
  CourseLevelEnum,
} from "@/schemas/physicalCourse.schema";

import {
  useCreateCourse,
  useUpdateCourse,
  useCourse,
} from "@/hooks/useAdminCourses";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

type Props = {
  courseId?: string;
};

function normalizeCourseLevel(
  level: any
): CourseLevel {
  return CourseLevelEnum.safeParse(level).success
    ? (level as CourseLevel)
    : "beginner";
}

export function normalizeRequiredString(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}


export function PhysicalCourseForm({ courseId }: Props) {
  const { data: existing, isPending: loadingExisting } =
    useCourse(courseId);

  const create = useCreateCourse();
  const update = useUpdateCourse(courseId!);

  const form = useForm<PhysicalCourseInput>({
    resolver: zodResolver(physicalCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "physical",
      level: "beginner",
      schedule: "",
      category: "",
      duration: "",
      programId: "",
      thumbnail: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  /* ---------- Edit mode ---------- */
  useEffect(() => {
    if (!existing) return;

    reset({
      title: existing.title,
      description: existing.description ?? "",
      type: "physical",
      level: normalizeCourseLevel(existing.level),
      schedule: existing.schedule,
      category: normalizeRequiredString(existing.category),
      duration: existing.duration,
      thumbnail: typeof existing.thumbnail === "string"
        ? existing.thumbnail
        : "",
      programId: existing.programId,
    });
  }, [existing, reset]);

  /* ---------- Submit ---------- */
  const onSubmit: SubmitHandler<PhysicalCourseInput> =
    async (values) => {
      try {
        if (courseId) {
          await update.mutateAsync(values);
          toast.success("Course updated");
        } else {
          await create.mutateAsync(values);
          toast.success("Course created");
          reset();
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Operation failed");
      }
    };

  if (loadingExisting) {
    return (
      <div className="py-8 text-center text-gray-500">
        Loading course…
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <Card className="rounded-3xl shadow-2xl border-none">
        <CardHeader className="bg-gradient-to-br from-indigo-500 to-blue-600 p-8">
          <CardTitle className="text-3xl font-bold text-white">
            Physical Course Setup
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 grid md:grid-cols-2 gap-8">
          <InputField
            label="Title"
            {...register("title")}
            error={errors.title?.message}
          />

          <div className="md:col-span-2">
            <TextareaField
              label="Description"
              {...register("description")}
              error={errors.description?.message}
            />
          </div>

          <SelectField
            label="Level"
            value={watch("level")}
            onChange={(v) =>
              setValue("level", v as PhysicalCourseInput["level"])
            }
            options={[
              "beginner",
              "intermediate",
              "advanced",
              "expert",
            ]}
            error={errors.level?.message}
          />

          <InputField
            label="Schedule"
            {...register("schedule")}
            error={errors.schedule?.message}
          />

          <InputField
            label="Category"
            {...register("category")}
            error={errors.category?.message}
          />

          <InputField
            label="Duration (e.g. 6 weeks)"
            {...register("duration")}
            error={errors.duration?.message}
          />

          <InputField
            label="Program ID"
            {...register("programId")}
            error={errors.programId?.message}
          />

          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium">
              Thumbnail URL
            </Label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                {...register("thumbnail")}
              />
            </div>
            {errors.thumbnail?.message && (
              <p className="text-xs text-red-500">
                {errors.thumbnail.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            create.isPending 
            // || update.isPending
          }
        >
          {courseId ? "Update Course" : "Create Course"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}

/* ---------- Reusable Fields ---------- */

type BaseFieldProps = {
  label: string;
  error?: string;
};

function InputField({
  label,
  error,
  ...props
}: BaseFieldProps &
  React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input {...props} />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function TextareaField({
  label,
  error,
  ...props
}: BaseFieldProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea {...props} />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
