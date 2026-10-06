"use client";

import { useState } from "react";
import Link from "next/link";
import { useApplicantsList } from "@/hooks/useApplicants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ApplicantTable } from "@/components/applicants/pplicanttable";

export default function ApplicantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

const { data, isLoading } = useApplicantsList({
  page,
  search,
  status: statusFilter,
});

const applicants = Array.isArray(data?.data) ? data.data : [];
const totalPages: number =
  typeof data?.meta?.pages === "number" ? data.meta.pages : 1;

  return (
    <div className="space-y-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-8">
          <h1 className="text-32 font-bold">Applicants</h1>
          <p className="text-muted-foreground">Manage and track all applications</p>
        </div>
        <Link href="/applicants/create">
          <Button size="lg">
            <Plus className="mr-8 h-16 w-16" />
            New Applicant
          </Button>
        </Link>
      </div>

      {/* Stats Dashboard */}
      {/* <ApplicantStatsCard /> */}

      {/* Table */}
      <ApplicantTable
        applicants={applicants}
        isLoading={isLoading}
        onSearch={setSearch}
        onStatusFilter={setStatusFilter}
        onPageChange={setPage}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}