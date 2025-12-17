"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Search,
  Download,
  MoreVertical,
  CheckCircle2,
  Clock,
  BookOpen,
  Grid as GridIcon,
  List,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEnrollments } from "@/hooks/useEnrollments";
import type { Enrollment, EnrollmentStatus } from "@/types/enrollment";
import { statusConfig } from "@/utils/statusConfig";

type ViewMode = "grid" | "table";
type StatusFilter = EnrollmentStatus | "all";

export default function AdminEnrollmentsPage() {
  const { data = [], isLoading, error } = useEnrollments();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter((e) => {
      return (
        (e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.course?.title || "").toLowerCase().includes(q)) &&
        (statusFilter === "all" || e.status === statusFilter)
      );
    });
  }, [data, searchQuery, statusFilter]);

  const stats = useMemo(
    () => ({
      total: data.length,
      registered: data.filter((e) => e.status === "REGISTERED").length,
      pending: data.filter((e) => e.status === "PENDING").length,
      completed: data.filter((e) => e.status === "COMPLETED").length,
    }),
    [data]
  );

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleAction = (
    action: "edit" | "delete",
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    console.log(`${action} enrollment ${id}`); // Replace with actual impl
  };

  if (isLoading) return <SkeletonGrid count={4} />;
  if (error)
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : "Failed to load"}
      />
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
            <p className="text-sm text-gray-500 mt-1">Manage course requests</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Total"
            value={stats.total}
            icon={Users}
            color="bg-blue-50 text-blue-600"
          />
          <Stat
            label="Registered"
            value={stats.registered}
            icon={CheckCircle2}
            color="bg-green-50 text-green-600"
          />
          <Stat
            label="Pending"
            value={stats.pending}
            icon={Clock}
            color="bg-yellow-50 text-yellow-600"
          />
          <Stat
            label="Completed"
            value={stats.completed}
            icon={BookOpen}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 h-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="REGISTERED">Registered</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredData.length === 0 ? (
          <EmptyState />
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((e) => {
              const config = statusConfig[e.status];
              return (
                <div
                  key={e.id}
                  className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md cursor-pointer group"
                  onClick={() => setSelectedEnrollment(e)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{e.name}</h3>
                      <p className="text-sm text-gray-500">{e.email}</p>
                    </div>
                    <Actions id={e.id} onAction={handleAction} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Badge className={`${config.color} text-white`}>
                      {config.label}
                    </Badge>
                    {e.course?.type === "physical" && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" /> Physical
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    {e.course?.title || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(e.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((e) => {
                  const config = statusConfig[e.status];
                  return (
                    <TableRow
                      key={e.id}
                      className="hover:bg-gray-50"
                      onClick={() => setSelectedEnrollment(e)}
                    >
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>{e.course?.title || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={`${config.color} text-white`}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(e.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Actions id={e.id} onAction={handleAction} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <EnrollmentDialog
        enrollment={selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
        formatDate={formatDate}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function Actions({
  id,
  onAction,
}: {
  id: string;
  onAction: (
    action: "edit" | "delete",
    id: string,
    e: React.MouseEvent
  ) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => onAction("edit", id, e)}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => onAction("delete", id, e)}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white p-8 text-center rounded-xl shadow-sm border">
      <Users className="mx-auto h-8 w-8 text-gray-300" />
      <p className="mt-4 text-gray-600">No enrollments found</p>
    </div>
  );
}

function EnrollmentDialog({
  enrollment,
  onClose,
  formatDate,
}: {
  enrollment: Enrollment | null;
  onClose: () => void;
  formatDate: (date: string | Date) => string;
}) {
  if (!enrollment) return null;
  return (
    <Dialog open={!!enrollment} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enrollment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>
            <strong>Name:</strong> {enrollment.name}
          </p>
          <p>
            <strong>Email:</strong> {enrollment.email}
          </p>
          <p>
            <strong>Course:</strong> {enrollment.course?.title || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <Badge
              className={`${statusConfig[enrollment.status].color} text-white`}
            >
              {statusConfig[enrollment.status].label}
            </Badge>
          </p>
          <p>
            <strong>Date:</strong> {formatDate(enrollment.createdAt)}
          </p>
          {enrollment.phone && (
            <p>
              <strong>Phone:</strong> {enrollment.phone}
            </p>
          )}
          {enrollment.note && (
            <p>
              <strong>Note:</strong> {enrollment.note}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
