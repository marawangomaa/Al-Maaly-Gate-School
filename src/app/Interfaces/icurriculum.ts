export interface Curriculum {
  id: string;
  name: string;
  code: string;
  description: string;
  gradeCount: number;
  studentCount: number;
  teacherCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCurriculum {
  name: string;
  code: string;
  description: string;
}

export interface UpdateCurriculum {
  name: string;
  code: string;
  description: string;
}

export interface GradeView {
  id: string;
  gradeName: string;
  classCount: number;
  subjectCount: number;
}

export interface StudentView {
  id: string;
  fullName: string;
  email: string;
  className: string;
  age: number;
  classId?: string;
  contactInfo?: string;
  gradeName: string;
  profileStatus: string;
}

export interface TeacherView {
  id: string;
  fullName: string;
  email: string;
}

export interface CurriculumDetails extends Curriculum {
  grades: GradeView[];
  students: StudentView[];
  teachers: TeacherView[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}