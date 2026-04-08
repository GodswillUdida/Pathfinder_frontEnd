// app/reset-password/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from "react"; // Required for React.use()

const resetFormSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetFormSchema>;

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [tokenStatus, setTokenStatus] = useState<
    "loading" | "valid" | "invalid"
  >("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Official Next.js 15+ way to unwrap dynamic params
  const { token } = React.use(params);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Verify token validity
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        console.log("Verifying token:", token);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/verify/${token}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setTokenStatus(data.valid ? "valid" : "invalid");
      } catch {
        setTokenStatus("invalid");
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            token,
            newPassword: values.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password.",
      });

      setTimeout(() => {
        router.replace("/auth/login");
      }, 1800);
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (tokenStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-slate-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenStatus === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <Card className="max-w-md w-full p-10 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-2xl font-semibold">
            Invalid or expired link
          </h2>
          <p className="mt-3 text-slate-600">
            This password reset link has expired or is invalid.
          </p>
          <Button
            onClick={() => router.push("/auth/forgot-password")}
            className="mt-6 w-full"
          >
            Request a new reset link
          </Button>
        </Card>
      </div>
    );
  }

  // Valid token → Show reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="max-w-md w-full p-10">
        <div className="text-center mb-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="text-slate-600 mt-2">Enter your new password below</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              type="password"
              placeholder="New password (min 8 characters)"
              {...form.register("password")}
              className="h-12"
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1.5">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Confirm new password"
              {...form.register("confirmPassword")}
              className="h-12"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1.5">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          After resetting, you'll be redirected to login.
        </p>
      </Card>
    </div>
  );
}
