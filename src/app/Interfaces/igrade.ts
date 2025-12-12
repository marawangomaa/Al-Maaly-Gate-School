import { ClassDto, ClassViewDto } from "./iclass";
import { SubjectCreateDto, SubjectViewDto } from "./isubject";

export interface GradeViewDto {
  id: string;
  gradeName: string;
  description: string;
  curriculumId: string;
  curriculumName: string;
  classCount: number;
  subjectCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGradeDto {
  gradeName: string;
  description: string;
  curriculumId: string;
}

export interface UpdateGradeDto {
  gradeName: string;
  description: string;
  curriculumId: string;
}


export interface GradeWithDetailsDto {
  id: string;
  gradeName: string;
  description: string;
  curriculumId: string;
  curriculum: {
    id: string;
    name: string;
    code: string;
    description: string;
    gradeCount: number;
    studentCount: number;
    teacherCount: number;
    createdAt: string;
    updatedAt?: string;
  };
  classes: ClassViewDto[];
  subjects: SubjectViewDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClassInGradeDto {
  className: string;
}

export interface MoveClassDto {
  classId: string;
  newGradeId: string;
}

export interface MoveSubjectDto {
  subjectId: string;
  newGradeId: string;
}

export interface AddClassToGradeDto {
  gradeId: string;
  class: ClassDto;
}

export interface AddSubjectToGradeDto {
  gradeId: string;
  subject: SubjectCreateDto;
}