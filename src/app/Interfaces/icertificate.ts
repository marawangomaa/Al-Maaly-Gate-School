// interfaces/icertificate.ts
export interface Certificate {
  id: string;
  studentId: string;
  studentName?: string;
  degreeType: DegreeType;
  certificateNumber: string;
  issuedDate: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
  archived: boolean;
  archivedDate?: Date;
  academicYear?: string;
  curriculumId?: string;
  gradeId?: string;
  classId?: string;
  pdfData?: Uint8Array;
  fileName: string;
  createdAt: Date;
  updatedAt?: Date;
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

export interface VerifyCertificateRequest {
  verifiedBy: string;
}

// For bulk operations
export interface BulkCertificateRequest {
  classId: string;
  degreeType: DegreeType;
  academicYear?: string;
}

// For search filters
export interface CertificateSearchFilters {
  studentName?: string;
  certificateNumber?: string;
  curriculumId?: string;
  gradeId?: string;
  classId?: string;
  degreeType?: DegreeType;
  academicYear?: string;
  fromDate?: Date;
  toDate?: Date;
}

// For certificate statistics
export interface CertificateStats {
  total: number;
  verified: number;
  pendingVerification: number;
  archived: number;
  byDegreeType: Record<DegreeType, number>;
  byAcademicYear: Record<string, number>;
}
