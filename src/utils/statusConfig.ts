import type { EnrollmentStatus } from "@/types/enrollment";
import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

type StatusConfig = {
  label: string;
  color: string;
  icon: LucideIcon;
  dotColor: string;
};

export const statusConfig: Record<EnrollmentStatus, StatusConfig> = {
  REGISTERED: {
    label: "Registered",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    dotColor: "bg-green-500",
  },
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
    dotColor: "bg-yellow-500",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CheckCircle2,
    dotColor: "bg-blue-500",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    dotColor: "bg-red-500",
  },
};
