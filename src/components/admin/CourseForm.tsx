"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, CreateCourseInput } from "@/schemas/courseSchemas";
import {
  useCreateCourse,
  useUpdateCourse,
  useCourse,
} from "@/hooks/useAdminCourses";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Props: optional courseId for edit mode
export function CourseForm({ courseId }: { courseId?: string }) {
  const { data: existing, isLoading: loadingExisting } = useCourse(courseId);
  const create = useCreateCourse();
  const update = courseId ? useUpdateCourse(courseId) : null;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      thumbnail: "",
      price: 0,
      type: "",
      level: "undefined",
      duration: "",
      category: "",
      tags: [],
      programId: undefined,
      instructorId: undefined,
      videoPreview: "",
      modules: [],
    },
  });

  const {
    fields: modules,
    append: appendModule,
    remove: removeModule,
  } = useFieldArray({
    control,
    name: "modules",
  });

  // Reset form with existing data
  useEffect(() => {
    if (existing) {
      reset({
        ...existing,
        modules:
          existing.modules?.map((m) => ({
            ...m,
            topics: m.topics ?? [],
          })) ?? [],
      });
    }
  }, [existing, reset]);

  async function onSubmit(values: CreateCourseInput) {
    try {
      if (courseId) {
        await update!.mutateAsync(values);
        toast.success("Course updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Course created");
        reset();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.error ?? err.message ?? "Operation failed"
      );
    }
  }

  if (loadingExisting) return <div>Loading course...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <InputField
        label="Title"
        {...register("title")}
        error={errors.title?.message}
      />
      {/* <InputField
        label="Slug (optional)"
        {...register("slug")}
        error={errors.slug?.message}
      /> */}
      <TextareaField
        label="Description"
        {...register("description")}
        error={errors.description?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* <InputField
          label="Price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
        /> */}
        <SelectField
          label="Type"
          {...register("type")}
          options={["online", "physical"]}
        />
        <SelectField
          label="Level"
          {...register("level")}
          options={["", "beginner", "intermediate", "advanced", "expert"]}
        />
        <InputField label="Duration" {...register("duration")} />
      </div>

      {/* Modules */}
      {/* <ModulesFieldArray
        modules={modules}
        append={appendModule}
        remove={removeModule}
        control={control}
        setValue={setValue}
      /> */}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || create.isLoading || update?.isLoading}
        >
          {courseId ? "Update Course" : "Create Course"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => reset()}>
          Reset
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Reusable Inputs ---------------- */
function InputField({ label, error, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <Input {...props} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

function TextareaField({ label, error, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <Textarea {...props} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

function SelectField({ label, options, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <select {...props} className="w-full">
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------------- Modules Field Array ---------------- */
function ModulesFieldArray({
  modules,
  append,
  remove,
  control,
  setValue,
}: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Modules</h3>
        <Button
          type="button"
          onClick={() => append({ title: "", description: "", topics: [] })}
        >
          Add module
        </Button>
      </div>

      {modules.map((m: any, idx: number) => (
        <div key={m.id} className="border rounded p-4 mb-4">
          <InputField
            label="Module Title"
            {...control.register(`modules.${idx}.title`)}
          />
          <TextareaField
            label="Description"
            {...control.register(`modules.${idx}.description`)}
          />
          <Button variant="outline" type="button" onClick={() => remove(idx)}>
            Remove module
          </Button>

          {/* Topics */}
          <ModuleTopics
            nestIndex={idx}
            control={control}
            setValue={setValue}
            topics={m.topics ?? []}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Nested Topics ---------------- */
function ModuleTopics({ nestIndex, control, setValue, topics }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `modules.${nestIndex}.topics`,
  });

  useEffect(() => {
    // initialize topics if empty
    if (!fields.length && topics.length) {
      topics.forEach((t: any) => append(t));
    }
  }, [topics, append, fields.length]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Topics</h4>
        <Button
          type="button"
          onClick={() => append({ title: "", videoUrl: "", resources: [] })}
        >
          Add topic
        </Button>
      </div>

      {fields.map((t: any, tIdx: number) => (
        <div key={t.id} className="border rounded p-3 mb-2">
          <InputField
            label="Title"
            {...control.register(`modules.${nestIndex}.topics.${tIdx}.title`)}
          />
          <InputField
            label="Video URL"
            {...control.register(
              `modules.${nestIndex}.topics.${tIdx}.videoUrl`
            )}
          />
          <InputField
            label="Resources"
            {...control.register(
              `modules.${nestIndex}.topics.${tIdx}.resources`
            )}
            onBlur={(e: any) => {
              const val = e.target.value;
              const arr = val
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
              setValue(`modules.${nestIndex}.topics.${tIdx}.resources`, arr);
            }}
          />
          <Button variant="outline" type="button" onClick={() => remove(tIdx)}>
            Remove topic
          </Button>
        </div>
      ))}
    </div>
  );
}
