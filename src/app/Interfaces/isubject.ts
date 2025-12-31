import { DegreeComponentTypeDto } from "./icomponenttype";

export interface SubjectViewDto {
  id: string;
  subjectName: string;
  gradeId: string;
  gradeName: string;
  creditHours: number;
  teacherCount: number;
  examCount: number;
  createdAt: string;
  updatedAt?: string;
  
  // NEW: Component types information
  componentTypes: DegreeComponentTypeDto[];
  hasComponentTypes: boolean;
  componentTypeCount: number;
}

export interface SubjectCreateDto {
  subjectName: string;
  gradeId: string;
  creditHours: number;
}

export interface SubjectUpdateDto {
  id: string;
  subjectName: string;
  gradeId: string;
  creditHours: number;
}
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
