/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/userStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Schema (assuming same as provided, but adjusted for consistency)
const registerSchema = z.object({
  name: z.string().min(3, "Name too short"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password too short"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const { register: registerUser, error, isLoading } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  /* ---------- Form ---------- */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  /* ---------- Submit ---------- */
  const onSubmit = (data: RegisterForm) => {
    startTransition(async () => {
      try {
        await registerUser(data.name, data.email, data.password);

        toast.success("Registered successfully");

        router.push("/auth/login"); // Or auto-login and push to dashboard
      } catch (err: any) {
        toast.error(err?.message ?? "Registration failed");
      }
    });
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar/>
      <div className="container mx-auto px-4 py-8 lg:py-0">
        <div className="grid lg:grid-cols-2 min-h-screen gap-8 lg:gap-0">
          {/* ---------------- Left Side (Brand) ---------------- */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden p-12 my-5 rounded-sm"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-600 opacity-95" />
            <div className="absolute inset-0 bg-grid-white/10" />

            <div className="relative z-10 max-w-md text-center space-y-8">
              <Link href="/" className="inline-block mb-8">
                <Image
                  src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                  alt="Accountant Pathfinder"
                  width={200}
                  height={100}
                  loading="eager"
                  className="h-20 w-auto brightness-0 invert"
                />
              </Link>

              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Join Us Today
              </h1>
              <p className="text-lg text-blue-100">
                Start your learning journey with us.
              </p>

              <div className="pt-8">
                <div className="relative w-full h-64 rounded-2xl overflow-hidden border-4 border-white/20">
                  <Image
                    src="https://accountantss-pathfinder.vercel.app/assets/CLASS1-hETG9bAq.webp"
                    alt="Students"
                    width={400}
                    height={300}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---------------- Right Side (Form) ---------------- */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12"
          >
            <div className="lg:hidden mb-8">
              <Image
                src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                alt="Logo"
                width={180}
                height={45}
                className="h-10 w-auto"
              />
            </div>

            <Card className="w-full max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-3xl font-bold">Register</CardTitle>
                <CardDescription className="text-base">
                  Create your account to get started
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* ---------------- Name ---------------- */}
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Your full name"
                        className="pl-11 h-12"
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* ---------------- Email ---------------- */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-11 h-12"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* ---------------- Password ---------------- */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Password</Label>
                      {/* Optional: Add forgot link if needed */}
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-11 pr-11 h-12"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* ---------------- Server Error ---------------- */}
                  {error && (
                    <p className="p-3 text-red-600 bg-red-50 rounded-lg text-sm">
                      {error}
                    </p>
                  )}

                  {/* ---------------- Submit Button ---------------- */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg"
                    disabled={isLoading || isPending}
                  >
                    {isLoading || isPending ? "Loading..." : "Sign Up"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-900">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <p className="text-center text-gray-600 dark:text-gray-400">
                  <Link href="/auth/login" className="text-blue-600">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>

            <p className="mt-8 text-sm text-gray-600 dark:text-gray-400 text-center">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-600">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="text-blue-600">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
