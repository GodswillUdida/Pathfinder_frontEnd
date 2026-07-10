"use client";

import { useRouter } from "next/navigation";
// import { ApplicantForm } from "@/components/applicants/ApplicantForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateApplicantPage() {
  const router = useRouter();

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center gap-16">
        <Link href="/applicants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-8 h-16 w-16" />
            Back
          </Button>
        </Link>
        {/* <div>
          <h1 className="text-32 font-bold">New Applicant</h1>
          <p className="text-muted-foreground mt-4">Register a new applicant to the system</p>
        </div> */}
      </div>

      {/* Form */}
      {/* <ApplicantForm onSuccess={() => router.push("/applicants")} /> */}
    </div>
  );
}