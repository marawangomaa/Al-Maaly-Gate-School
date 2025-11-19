export interface SubjectCreateDto {
  subjectName: string;
  classYear: string;
  classId: string;
  creditHours: number;
}

export interface SubjectUpdateDto {
  id: string;
  subjectName: string;
  classYear: string;
  classId?: string;
  teacherId?: string;
}

export interface SubjectViewDto {
  id: string;
  subjectName: string;
  classYear: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  examCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
