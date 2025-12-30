import { DegreeComponentTypeDto } from "./icomponenttype";
import { SubjectViewDto } from "./isubject";

export interface DegreeComponentType {
  id: string;
  subjectId: string;
  componentName: string;
  order: number;
  maxScore: number;
  isActive: boolean;
}

export interface DegreeComponent {
  id?: string;
  componentTypeId: string;
  componentName: string;
  score: number;
  maxScore?: number;  // Make optional to match backend
}


export interface DegreeInput {
  subjectId: string;
  degreeType: number;  // Change from string to number to match DegreeType enum
  score?: number;
  maxScore?: number;
  components?: DegreeComponent[];
}

export interface AddDegreesDto {
  studentId: string;
  degrees: DegreeInput[];
}

export interface DegreeItemDto {
  degreeId: string;
  subjectId: string;
  subjectName: string;
  degreeType: number;  // Change to number
  degreeTypeName?: string; // Add this for display
  score: number;
  maxScore: number;
  components: DegreeComponentDto[];
  hasComponents: boolean;
}

export interface DegreeComponentDto {
  id: string;
  componentTypeId: string;
  componentName: string;
  score: number;
  maxScore: number;
}

export interface StudentDegreesDto {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  degrees: DegreeItemDto[];
}

export enum DegreeType {
  MidTerm1 = 1,
  Final1 = 2,
  MidTerm2 = 3,
  Final2 = 4
}

export interface ExamTypeConfig {
  name: string;
  type: number;
  maxScore: number;
  weight: number;
}

export interface SubjectWithComponents extends SubjectViewDto {
  componentTypes: DegreeComponentTypeDto[]; // Remove optional
  midtermMaxScore?: number;
  finalMaxScore?: number;
}