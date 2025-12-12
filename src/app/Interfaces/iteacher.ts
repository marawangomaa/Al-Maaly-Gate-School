import { Curriculum } from './icurriculum';
import { ClassDto } from './iclass';
import { SubjectViewDto } from './isubject';

export interface TeacherViewDto {
  id: string;
  fullName: string;
  email: string;
  contactInfo: string;
  appUserId: string;
  profileStatus: string;
  subjects: string[];
  classNames: string[];
  specializedCurricula: string[]; // Added: curriculum names
  specializedCurriculumIds: string[]; // Added: curriculum IDs
}

export interface TeacherDetailsDto {
  id: string;
  fullName: string;
  email: string;
  contactInfo: string;
  appUserId: string;
  profileStatus: string;
  subjects: string[];
  classNames: string[];
  specializedCurricula: Curriculum[]; // Full curriculum objects
  assignedClasses: ClassDto[];
  assignedSubjects: SubjectViewDto[];
}

export interface TeacherAdminViewDto {
  id: string;
  fullName: string;
  email: string;
  contactInfo: string;
  subjects: string[];
  classNames: string[];
  AccountStatus: string;
}

export interface CreateTeacherDto {
  name: string;
  email: string;
  appUserId: string;
  specializedCurriculumIds: string[]; // Added: specialized curriculum IDs
}

export interface UpdateTeacherDto {
  name: string;
  email: string;
  specializedCurriculumIds: string[]; // Added: specialized curriculum IDs
}

export interface ServiceResult<T> {
  data?: T;
  message?: string;
  success: boolean;
}

export interface BulkAssignTeachersDto {
  classIds: string[];
  teacherIds: string[];
}

export interface AddTeacherToCurriculumDto {
  teacherId: string;
  curriculumId: string;
}
export interface TeacherAdminViewDto {
  id: string;
  fullName: string;
  email: string;
  subjects: string[];
  classNames: string[];
  AccountStatus: string;
}