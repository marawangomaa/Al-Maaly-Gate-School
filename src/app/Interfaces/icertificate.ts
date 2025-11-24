// interfaces/icertificate.ts
export interface Certificate {
  id: string;
  studentId: string;
  studentName?: string;
  gpa: number;
  issuedDate: string;
  templateName: string;
  degreeType: DegreeType;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export enum DegreeType {
  MidTerm1 = 'MidTerm1',
  Final1 = 'Final1',
  MidTerm2 = 'MidTerm2',
  Final2 = 'Final2'
}

export interface GenerateCertificateRequest {
  studentId: string;
  degreeType: DegreeType;
  saveToDb?: boolean;
}

export interface GenerateCertificateResponse {
  message: string;
  certificateId?: string;
  studentId: string;
  degreeType: DegreeType;
  gpa: number;
  fileSize: number;
  issuedDate: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}