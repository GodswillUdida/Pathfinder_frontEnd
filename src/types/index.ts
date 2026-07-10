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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data:    T;
  message?: string;
  meta?:   Record<string, unknown>;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}
