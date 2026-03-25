export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string | "student" | "admin" | "instructor" | "superadmin";
  emailVerified?: boolean;
};
