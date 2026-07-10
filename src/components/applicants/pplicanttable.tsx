"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteApplicant } from "@/hooks/useApplicants";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Eye } from "lucide-react";

interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status?: string;
  createdAt: string;
}

interface ApplicantTableProps {
  applicants: Applicant[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: string) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  interviewed: "bg-blue-100 text-blue-800",
};

export function ApplicantTable({
  applicants,
  isLoading = false,
  onSearch,
  onStatusFilter,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
}: ApplicantTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { toast } = useToast();
  const deleteApplicant = useDeleteApplicant();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    onStatusFilter?.(value === "all" ? "" : value);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteApplicant.mutateAsync(deleteId);
      toast({
        title: "Success",
        description: "Applicant deleted successfully",
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete applicant",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-2">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">Search</label>
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : applicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No applicants found</p>
                </TableCell>
              </TableRow>
            ) : (
              applicants.map((applicant) => (
                <TableRow key={applicant.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{applicant.fullName}</TableCell>
                  <TableCell className="text-sm">{applicant.email}</TableCell>
                  <TableCell className="text-sm">{applicant.phone}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        STATUS_COLORS[applicant.status?.toLowerCase() || "pending"]
                      }`}
                    >
                      {applicant.status || "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(applicant.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Link href={`/applicants/${applicant.id}`}>
                      <Button variant="ghost" size="sm" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(applicant.id)}
                      title="Delete applicant"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Applicant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this applicant? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteApplicant.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteApplicant.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}