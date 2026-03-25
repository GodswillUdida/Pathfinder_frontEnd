// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useEffect } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { createCourseSchema, CreateCourseInput } from "@/schemas/courseSchemas";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";

// interface CourseFormProps {
//   courseId?: string;
//   initialData?: CreateCourseInput;
//   onSubmit?: (values: CreateCourseInput) => Promise<void>;
// }

// export function CourseForm({
//   courseId,
//   initialData,
//   onSubmit,
// }: CourseFormProps) {
//   const {
//     control,
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//     setValue,
//   } = useForm<CreateCourseInput>({
//     resolver: zodResolver(createCourseSchema),
//     defaultValues: initialData ?? {
//       title: "",
//       slug: "",
//       description: "",
//       thumbnail: "",
//       price: 0,
//       type: "physical",
//       level: "beginner",
//       duration: "",
//       category: "",
//       tags: [],
//       programId: "",
//       instructorId: "",
//       videoPreview: "",
//       modules: [],
//     },
//   });

//   const {
//     fields: modules,
//     append: appendModule,
//     remove: removeModule,
//   } = useFieldArray({ control, name: "modules" });

//   // Reset form when initialData changes (edit mode)
//   useEffect(() => {
//     if (initialData) {
//       reset({
//         ...initialData,
//         modules:
//           initialData.modules?.map((m) => ({
//             ...m,
//             topics: m.topics ?? [],
//           })) ?? [],
//       });
//     }
//   }, [initialData, reset]);

//   const internalSubmit = async (values: CreateCourseInput) => {
//     if (onSubmit) {
//       await onSubmit(values);
//     } else {
//       toast.error("No submit handler provided");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(internalSubmit)} className="space-y-6">
//       <InputField
//         label="Title"
//         {...register("title")}
//         error={errors.title?.message}
//       />
//       <TextareaField
//         label="Description"
//         {...register("description")}
//         error={errors.description?.message}
//       />

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <SelectField
//           label="Type"
//           {...register("type")}
//           options={["online", "physical"]}
//         />
//         <SelectField
//           label="Level"
//           {...register("level")}
//           options={["beginner", "intermediate", "advanced", "expert"]}
//         />
//         <InputField label="Duration" {...register("duration")} />
//       </div>

//       <Button
//         type="button"
//         onClick={() => appendModule({ title: "", description: "", topics: [] })}
//       >
//         Add Module
//       </Button>

//       <div className="flex gap-3">
//         <Button type="submit" disabled={isSubmitting}>
//           {courseId ? "Update Course" : "Create Course"}
//         </Button>
//         <Button type="button" variant="ghost" onClick={() => reset()}>
//           Reset
//         </Button>
//       </div>
//     </form>
//   );
// }

// /* ---------------- Input Components ---------------- */
// function InputField({ label, error, ...props }: any) {
//   return (
//     <div>
//       <label className="block text-sm font-medium">{label}</label>
//       <Input {...props} />
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//     </div>
//   );
// }

// function TextareaField({ label, error, ...props }: any) {
//   return (
//     <div>
//       <label className="block text-sm font-medium">{label}</label>
//       <Textarea {...props} />
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//     </div>
//   );
// }

// function SelectField({ label, options, ...props }: any) {
//   return (
//     <div>
//       <label className="block text-sm font-medium">{label}</label>
//       <select {...props} className="w-full">
//         {options.map((opt: string) => (
//           <option key={opt} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }
