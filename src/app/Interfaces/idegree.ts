export interface DegreeInput {
  subjectId: string;
  degreeType: string;
  
  // Either total scores
  score?: number;
  maxScore?: number;
  
  // Or component scores
  oralScore?: number;
  oralMaxScore?: number;
  examScore?: number;
  examMaxScore?: number;
  practicalScore?: number;
  practicalMaxScore?: number;
}

export interface AddDegreesDto {
  studentId: string;
  degrees: DegreeInput[];
}

export interface DegreeItemDto {
  degreeId: string;
  subjectId: string;
  subjectName: string;
  degreeType: string;
  
  // Total scores
  score: number;
  maxScore: number;
  
  // Component details
  oralScore?: number;
  oralMaxScore?: number;
  examScore?: number;
  examMaxScore?: number;
  practicalScore?: number;
  practicalMaxScore?: number;
  
  // Helper property
  hasComponents: boolean;
}

export interface StudentDegreesDto {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  degrees: DegreeItemDto[];
}