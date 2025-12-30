// src/app/core/interfaces/degree-component-type.interface.ts
export interface CreateDegreeComponentTypeDto {
  subjectId: string;
  componentName: string;
  order: number;
  maxScore: number;
  isActive: boolean;
}

export interface UpdateDegreeComponentTypeDto {
  componentName: string;
  order: number;
  maxScore: number;
  isActive: boolean;
}

export interface DegreeComponentTypeDto {
  id: string;
  subjectId: string;
  componentName: string;
  order: number;
  maxScore: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  midtermMaxScore?: number;
  finalMaxScore?: number;
}