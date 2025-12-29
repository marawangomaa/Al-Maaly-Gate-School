import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { 
  ApiResponse, 
  Certificate, 
  DegreeType, 
  GenerateCertificateResponse,
  VerifyCertificateRequest
} from '../Interfaces/icertificate';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private readonly apiUrl = `${environment.apiUrl}/certificate`; // Updated to match backend route

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  // Get student ID from localStorage (browser only)
  private getStudentId(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('studentId');
    }
    return null;
  }

  // ========== GENERATE CERTIFICATES ==========

  // Generate certificate without saving to DB
  generateCertificate(studentId: string, degreeType: DegreeType): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${studentId}/${degreeType}`,
      { responseType: 'blob' }
    );
  }

  // Generate certificate and save to DB
  generateAndSaveCertificate(studentId: string, degreeType: DegreeType): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${studentId}/${degreeType}?saveToDb=true`,
      { responseType: 'blob' }
    );
  }

  // Save certificate to DB explicitly
  saveCertificateToDb(studentId: string, degreeType: DegreeType): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/${studentId}/${degreeType}/save`,
      {}
    );
  }

  // ========== GET CERTIFICATES ==========

  // Get certificate from database
  getCertificateFromDb(studentId: string, degreeType: DegreeType): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${studentId}/${degreeType}/from-db`,
      { responseType: 'blob' }
    );
  }

  // Get all certificates for a student
  getStudentCertificates(studentId: string): Observable<ApiResponse<Certificate[]>> {
    return this.http.get<ApiResponse<Certificate[]>>(
      `${this.apiUrl}/student/${studentId}`
    );
  }

  // Get certificates by curriculum
  getCertificatesByCurriculum(curriculumId: string, academicYear?: string): Observable<ApiResponse<Certificate[]>> {
    let url = `${this.apiUrl}/curriculum/${curriculumId}`;
    if (academicYear) {
      url += `?academicYear=${encodeURIComponent(academicYear)}`;
    }
    return this.http.get<ApiResponse<Certificate[]>>(url);
  }

  // Get certificates by grade
  getCertificatesByGrade(gradeId: string, academicYear?: string): Observable<ApiResponse<Certificate[]>> {
    let url = `${this.apiUrl}/grade/${gradeId}`;
    if (academicYear) {
      url += `?academicYear=${encodeURIComponent(academicYear)}`;
    }
    return this.http.get<ApiResponse<Certificate[]>>(url);
  }

  // Get certificates by class
  getCertificatesByClass(classId: string, academicYear?: string): Observable<ApiResponse<Certificate[]>> {
    let url = `${this.apiUrl}/class/${classId}`;
    if (academicYear) {
      url += `?academicYear=${encodeURIComponent(academicYear)}`;
    }
    return this.http.get<ApiResponse<Certificate[]>>(url);
  }

  // ========== BULK OPERATIONS ==========

   // Bulk generate certificates for a class
  bulkGenerateForClass(classId: string, degreeType: DegreeType, academicYear?: string): Observable<ApiResponse<boolean>> {
    // FIX: Changed from POST to GET if that's what your backend expects
    let url = `${this.apiUrl}/bulk/class/${classId}/${degreeType}`;
    if (academicYear) {
      url += `?academicYear=${encodeURIComponent(academicYear)}`;
    }
    return this.http.post<ApiResponse<boolean>>(url, {});
    // OR if your backend expects GET for this endpoint:
    // return this.http.get<ApiResponse<boolean>>(url);
  }

  // Download bulk certificates for a class as ZIP
  downloadBulkCertificatesForClass(classId: string, degreeType: DegreeType, academicYear?: string): Observable<Blob> {
    let url = `${this.apiUrl}/bulk/class/${classId}/${degreeType}/download`;
    if (academicYear) {
      url += `?academicYear=${encodeURIComponent(academicYear)}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }
  // ========== CERTIFICATE MANAGEMENT ==========

  // Verify a certificate
  verifyCertificate(certificateId: string, verifiedBy: string): Observable<ApiResponse<boolean>> {
    const request: VerifyCertificateRequest = { verifiedBy };
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/verify/${certificateId}`,
      request
    );
  }

  // Archive a certificate
  archiveCertificate(certificateId: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/archive/${certificateId}`,
      {}
    );
  }

  // ========== SEARCH CERTIFICATES ==========

  searchCertificates(filters: {
    studentName?: string;
    certificateNumber?: string;
    curriculumId?: string;
    gradeId?: string;
    classId?: string;
    degreeType?: DegreeType;
    academicYear?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Observable<ApiResponse<Certificate[]>> {
    let url = `${this.apiUrl}/search?`;
    const params: string[] = [];

    if (filters.studentName) params.push(`studentName=${encodeURIComponent(filters.studentName)}`);
    if (filters.certificateNumber) params.push(`certificateNumber=${encodeURIComponent(filters.certificateNumber)}`);
    if (filters.curriculumId) params.push(`curriculumId=${encodeURIComponent(filters.curriculumId)}`);
    if (filters.gradeId) params.push(`gradeId=${encodeURIComponent(filters.gradeId)}`);
    if (filters.classId) params.push(`classId=${encodeURIComponent(filters.classId)}`);
    if (filters.degreeType) params.push(`degreeType=${encodeURIComponent(filters.degreeType)}`);
    if (filters.academicYear) params.push(`academicYear=${encodeURIComponent(filters.academicYear)}`);
    if (filters.fromDate) params.push(`fromDate=${encodeURIComponent(filters.fromDate.toISOString())}`);
    if (filters.toDate) params.push(`toDate=${encodeURIComponent(filters.toDate.toISOString())}`);

    url += params.join('&');
    return this.http.get<ApiResponse<Certificate[]>>(url);
  }

  // ========== UTILITY METHODS ==========

  // Download blob as PDF file
  downloadPdf(blob: Blob, fileName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  // Download blob as ZIP file
  downloadZip(blob: Blob, fileName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  // Open PDF in new tab
  openPdfInNewTab(blob: Blob): void {
    if (isPlatformBrowser(this.platformId)) {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Note: We don't revoke the URL immediately as it's used in a new tab
    }
  }

  // Get current student's certificates
  getMyCertificates(): Observable<ApiResponse<Certificate[]>> {
    const studentId = this.getStudentId();
    if (!studentId) {
      throw new Error('Student ID not found in localStorage');
    }
    return this.getStudentCertificates(studentId);
  }

  // Generate certificate for current student
  generateMyCertificate(degreeType: DegreeType, saveToDb: boolean = false): Observable<Blob> {
    const studentId = this.getStudentId();
    if (!studentId) {
      throw new Error('Student ID not found in localStorage');
    }
    
    return saveToDb 
      ? this.generateAndSaveCertificate(studentId, degreeType)
      : this.generateCertificate(studentId, degreeType);
  }

  // Get certificate for current student from DB
  getMyCertificateFromDb(degreeType: DegreeType): Observable<Blob> {
    const studentId = this.getStudentId();
    if (!studentId) {
      throw new Error('Student ID not found in localStorage');
    }
    return this.getCertificateFromDb(studentId, degreeType);
  }
}