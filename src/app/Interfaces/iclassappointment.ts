export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
export interface ClassAppointmentDto {
  id: string;
  startTime: string;
  endTime: string;
  link?: string | null;
  status: string;
  classId: string;
  teacherId: string;
  subjectId: string;
}
export interface StudentClassAppointmentDto {
  id: string;
  startTime: string;
  endTime: string;
  link?: string | null;
  status: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
}
