export interface DegreeInput {
  subjectId: string;
  score: number;
  maxScore: number;
  degreeType: string; // Or enum if you want
}

export interface AddDegreesDto {
  studentId: string;
  degrees: DegreeInput[];
}

export interface DegreeItemDto {
  degreeId: string;
  subjectId: string;
  subjectName: string;
  score: number;
  maxScore: number;
  degreeType: string;
}

export interface StudentDegreesDto {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  degrees: DegreeItemDto[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
