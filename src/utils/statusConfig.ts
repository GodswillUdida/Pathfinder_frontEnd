import { EnrollmentStatus } from "@/types/domain";
import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

type StatusConfig = {
  label: string;
  color: string;
  icon: LucideIcon;
  dotColor: string;
};

export const statusConfig: Record<EnrollmentStatus, StatusConfig> = {
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    dotColor: "bg-green-500",
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
    dotColor: "bg-yellow-500",
  },
  REVOKED: {
    label: "Revoked",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: CheckCircle2,
    dotColor: "bg-gray-500",
  },
};
