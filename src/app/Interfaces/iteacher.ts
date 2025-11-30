export interface TeacherViewDto {
  id: string;
  fullName: string;
  email: string;
  contactInfo: string;
  appUserId: string;
  subjects: string[];
  classNames: string[];
}

export interface TeacherAdminViewDto {
  id: string;
  fullName: string;
  email: string;
  contactInfo: string;
  subjects: string[];
  classNames: string[];
  profileStatus: string;
}

export interface CreateTeacherDto {
  name: string;
  email: string;
  appUserId: string;
}

export interface UpdateTeacherDto {
  name: string;
  email: string;
}

export interface ServiceResult<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface BulkAssignTeachersDto {
  classIds: string[];
  teacherIds: string[];
}

export interface TeacherAdminViewDto {
  id: string;
  fullName: string;
  email: string;
  subjects: string[];
  classNames: string[];
  profileStatus: string;
}