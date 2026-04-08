export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: string | "student" | "admin" | "instructor" | "superadmin";
  emailVerified?: boolean;
};

export interface AuthTokens {
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: User;
}
