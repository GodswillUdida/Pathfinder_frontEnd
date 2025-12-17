
export type EnrollmentStatus =
  | "REGISTERED"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

export interface CourseLite {
  id: string;
  title: string;
  type: "physical" | "online";
}

export interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: EnrollmentStatus;
  notes?: string | null;
  createdAt: string;
  course: CourseLite;
}
