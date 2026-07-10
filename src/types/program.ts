import { CourseLevel, CourseStatus } from "./course";



export interface ProgramSummaryCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;  
  status: CourseStatus;
  level?: CourseLevel | null;
  duration?: number | null;
  published: boolean;
  pricings?: { id: string; name: string; price: number; currency: string; durationDays: number; isActive: boolean }[];
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  status: CourseStatus;
  createdAt:string;
  _count: {
    courses: number;
  };
}

export interface ProgramDetail extends Program {
  description?: string;
  price?: number | null;
  currency: string;
  courses: ProgramSummaryCourse[];
  updatedAt: string;
  deletedAt: string | null;
}