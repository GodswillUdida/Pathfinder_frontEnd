export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "admin" | "instructor" | "superadmin";
  emailVerified?: boolean;
};
