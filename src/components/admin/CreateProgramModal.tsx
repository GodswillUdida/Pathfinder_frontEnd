/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProgram } from "@/hooks/useAdminPrograms";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";

const programSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
});

type ProgramForm = z.infer<typeof programSchema>;

interface CreateProgramModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProgramModal({
  open,
  onClose,
  onCreated,
}: CreateProgramModalProps) {
  const { mutateAsync, isPending } = useCreateProgram();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProgramForm>({
    resolver: zodResolver(programSchema),
    defaultValues: { title: "", description: "" },
  });
  // const tokenFromState = useAuthStore((state) => state.accessToken);

  const onSubmit = async (data: ProgramForm) => {
    try {
      // const token = tokenFromState || localStorage.getItem("token");
      // if (!token) {
      //   toast.error("You are not logged in. Please login to continue.");
      //   return;
      // }

      await mutateAsync(data);
      toast.success("Program created successfully");
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      if (err.message?.includes("Authorization")) {
        toast.error("Authorization failed. Please login again.");
      } else {
        toast.error(err.message || "Failed to create program");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-linear-to-r from-blue-50 to-indigo-50 p-6">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Create New Program
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Title
            </Label>
            <Input
              id="title"
              className="h-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register("title")}
              aria-invalid={!!errors.title}
              aria-describedby="title-error"
            />
            {errors.title && (
              <p id="title-error" className="text-red-500 text-xs">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description (optional)
            </Label>
            <Textarea
              id="description"
              className="min-h-[100px] rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register("description")}
              aria-invalid={!!errors.description}
              aria-describedby="description-error"
            />
            {errors.description && (
              <p id="description-error" className="text-red-500 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>
          <DialogFooter className="bg-gray-50 p-6 flex justify-end space-x-3 border-t">
            <Button
              variant="outline"
              className="rounded-md border-gray-300 hover:bg-gray-100"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
