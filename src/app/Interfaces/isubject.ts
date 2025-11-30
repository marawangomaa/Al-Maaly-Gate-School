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
