"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { AlertCircle, Send, ShieldCheck, Clock, MapPin } from "lucide-react";

import {
  enrollmentRequestSchema,
  EnrollmentRequestInput,
} from "@/schemas/enrollment";
import { submitEnrollmentRequest } from "@/lib/api/enrollment";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
  courseId: string;
}

type FormValues = Omit<EnrollmentRequestInput, "courseId">;

export function PhysicalCourseLeadForm({ courseId }: Props) {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(enrollmentRequestSchema),
    mode: "onChange", // realtime validation
  });

  const onSubmit = async (data: FormValues) => {

    try {
      await submitEnrollmentRequest(courseId, data);

      toast.success("Request sent successfully", {
        description: "Our team will contact you shortly.",
      });

      reset();
    } catch (err) {
      toast.error("Submission failed", {
        description:
          err instanceof Error ? err.message : "Please try again later",
      });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Toaster richColors />
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* LEFT: COURSE + TRUST */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="space-y-3">
            <Badge variant="secondary">Physical Course</Badge>

            <h2 className="text-3xl font-semibold tracking-tight">
              On-site Training Program
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              This course is delivered in person. Submit your details to secure
              a slot or get more information from our admissions team.
            </p>
          </div>

          <Separator />

          {/* Trust indicators */}
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span>Your information is secure and never shared.</span>
            </li>

            <li className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Average response time is 24 -48 hours.</span>
            </li>

            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span>Location details shared after confirmation.</span>
            </li>
          </ul>
        </div>

        {/* RIGHT: FORM CARD */}
        <Card className="shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl">Request Enrollment</CardTitle>
            <CardDescription>
              Fill the form below and we’ll reach out.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <Field error={errors.name?.message} icon={<AlertCircle />}>
                <Input
                  {...register("name")}
                  placeholder="Full name"
                  className="h-11"
                />
              </Field>

              {/* Email */}
              <Field error={errors.email?.message} icon={<AlertCircle />}>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Email address"
                  className="h-11"
                />
              </Field>

              {/* Phone */}
              <Field error={errors.phone?.message} icon={<AlertCircle />}>
                <Input
                  {...register("phone")}
                  placeholder="Phone number"
                  className="h-11"
                />
              </Field>

              {/* Notes */}
              <Field error={errors.notes?.message}>
                <Textarea
                  {...register("notes")}
                  placeholder="Optional note (schedule, questions, etc.)"
                  className="min-h-24"
                />
              </Field>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 gap-2 transition-all duration-300"
              >
                {isSubmitting ? (
                  "Submitting…"
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ------------------ */
/* Reusable Field UI  */
/* ------------------ */

function Field({
  children,
  error,
  icon,
}: {
  children: React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 transition-all duration-300">
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          {icon}
          {error}
        </p>
      )}
    </div>
  );
}
