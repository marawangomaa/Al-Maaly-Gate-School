import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ApiResponse, Certificate, DegreeType, GenerateCertificateResponse } from '../Interfaces/icertificate';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private readonly apiUrl = `${environment.apiBaseUrl}/certificate`;

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
  saveCertificateToDb(studentId: string, degreeType: DegreeType): Observable<ApiResponse<GenerateCertificateResponse>> {
    return this.http.post<ApiResponse<GenerateCertificateResponse>>(
      `${this.apiUrl}/${studentId}/${degreeType}/save`,
      {}
    );
  }

  // Get certificate from database
  getCertificateFromDb(studentId: string, degreeType: DegreeType): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${studentId}/${degreeType}/from-db`,
      { responseType: 'blob' }
    );
  }

  // Get all certificates for a student (you might need to add this endpoint to your API)
  getStudentCertificates(studentId: string): Observable<ApiResponse<Certificate[]>> {
    return this.http.get<ApiResponse<Certificate[]>>(
      `${this.apiUrl}/student/${studentId}`
    );
  }

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
}
