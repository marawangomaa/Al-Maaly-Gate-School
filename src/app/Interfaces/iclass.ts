import { ClassAppointmentDto } from "./iclassappointment";
import { StudentModel } from "./istudent";
import { TeacherViewDto } from "./iteacher";

export interface ClassViewDto {
  id: string;
  className: string;
  gradeId: string;
  gradeName: string;
  studentCount: number;
  teacherCount: number;
  createdAt: string;
  updatedAt?: string;
  assignedTeachers: TeacherViewDto[];
  students?: any[];
  classAssets?: any[];
  classAppointments?: ClassAppointmentDto[];
  curriculumId?: string;      // Optional: from grade's curriculum
  curriculumName?: string;    // Optional: curriculum name for display
}

export interface ClassDto {
  id: string;
  className: string;
  gradeId: string;
}

export interface CreateClassDto {
  className: string;
  gradeId: string;
}

export interface UpdateClassDto {
  id: string;
  className: string;
  gradeId: string;
}

export interface ClassResultDto {
  classId: string;
  className: string;
  averageMark: number;
  studentCount: number;
  examCount: number;
}

export interface ClassStatisticsDto {
  classId: string;
  className: string;
  averageGpa: number;
  attendanceRate: number;
  completedExams: number;
  pendingAssignments: number;
  totalStudents: number;
  totalTeachers: number;
}

export interface BulkMoveClassesDto {
  classIds: string[];
  newGradeId: string;
}