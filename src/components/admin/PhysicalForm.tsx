"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema } from "@/schemas/courseSchemas"; // Adjust schema to match provided fields
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react"; // For thumbnail upload icon

// Updated type based on provided schema
type PhysicalCourseInput = {
  title: string;
  description: string;
  type: "physical";
  level: string;
  thumbnail: string;
  schedule: string;
  category: string;
  duration: string;
  program: { id: string };
};

export function PhysicalCourseForm({ courseId }: { courseId?: string }) {
  const { data: existing, isLoading: loadingExisting } = useCourse(courseId);
  const create = useCreateCourse();
  // const update = courseId ? useUpdateCourse(courseId) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PhysicalCourseInput>({
    resolver: zodResolver(createCourseSchema), // Use updated physical schema
    defaultValues: {
      title: "",
      description: "",
      type: "physical",
      level: "",
      schedule:"",
      thumbnail: "",
      category: "",
      duration: "",
      program: { id: "" },
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title || "",
        description: existing.description || "",
        type: "physical",
        level: existing.level || "",
        schedule: existing.schedule || "",
        thumbnail: existing.thumbnail || "",
        category: existing.category || "",
        duration: existing.duration || "",
        program: existing.program || { id: "" },
      });
    }
  }, [existing, reset]);

  async function onSubmit(values: PhysicalCourseInput) {
    try {
      if (courseId) {
        // await update!.mutateAsync(values);
        // toast.success("Course updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Course created");
        reset();
      }
    } catch (err: any) {
      toast.error(err.message ?? "Operation failed");
    }
  }

  if (loadingExisting)
    return (
      <div className="text-center py-8 text-gray-500">Loading course...</div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
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
            onChange={(v) => setValue("level", v)}
            options={["beginner", "intermediate", "advanced", "expert"]}
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
            label="Duration (e.g., 6 Weeks)"
            {...register("duration")}
            error={errors.duration?.message}
          />
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Thumbnail URL
            </Label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 h-10 rounded-md"
                {...register("thumbnail")}
              />
            </div>
            {errors.thumbnail?.message && (
              <p className="text-red-500 text-xs">{errors.thumbnail.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          disabled={isSubmitting || create.isLoading || update?.isLoading}
        >
          {courseId ? "Update Course" : "Create Course"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-full px-8 py-3"
          onClick={() => reset()}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}

/* Reusable Components */
function InputField({ label, error, ...props }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input
        className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

function TextareaField({ label, error, ...props }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Textarea
        className="min-h-[120px] rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent className="rounded-lg">
          {options.map((opt: string) => (
            <SelectItem key={opt} value={opt} className="rounded-md">
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
