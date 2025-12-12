import { Component, OnInit } from '@angular/core';
import { StudentModel } from '../../../../../Interfaces/istudent';
import { ClassService } from '../../../../../Services/class.service';
import { CertificateService } from '../../../../../Services/certificate.service';
import { 
  Certificate, 
  DegreeType, 
  CertificateSearchFilters 
} from '../../../../../Interfaces/icertificate';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { GradeViewDto } from '../../../../../Interfaces/igrade';
import { Curriculum } from '../../../../../Interfaces/icurriculum';
import { GradeService } from '../../../../../Services/grade.service';
import { CurriculumService } from '../../../../../Services/curriculum.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-certificate-generation',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-certificate-generation.component.html',
  styleUrl: './admin-certificate-generation.component.css'
})
export class AdminCertificateGenerationComponent implements OnInit {
  // Data arrays
  allClasses: ClassViewDto[] = []; // Store ALL classes
  filteredClasses: ClassViewDto[] = []; // Classes filtered by grade/curriculum
  students: StudentModel[] = [];
  filteredStudents: StudentModel[] = [];
  certificates: Certificate[] = [];
  grades: GradeViewDto[] = [];
  curricula: Curriculum[] = [];
  
  // Selection
  selectedClassId: string = '';
  selectedStudentId: string = '';
  selectedDegreeType: DegreeType = DegreeType.MidTerm1;
  selectedGradeId: string = '';
  selectedCurriculumId: string = '';
  selectedAcademicYear: string = new Date().getFullYear().toString();
  
  // UI state
  isGenerating = false;
  isSaving = false;
  isBulkGenerating = false;
  isDownloadingBulk = false;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  
  // Search filters
  searchFilters: CertificateSearchFilters = {};
  isSearching = false;
  
  // Options
  degreeTypes = Object.values(DegreeType);
  academicYears: string[] = [];
  
  // Tabs
  activeTab: 'generate' | 'search' | 'bulk' = 'generate';
  
  // Bulk operation - NEW: For the Bulk tab
  bulkClassId: string = '';
  bulkDegreeType: DegreeType = DegreeType.MidTerm1;
  bulkAcademicYear: string = new Date().getFullYear().toString();
  bulkOperationType: 'generate' | 'download' = 'generate'; // NEW: Type of bulk operation
  
  // Class-wide operation - NEW: For generating certificates for whole class
  classWideDegreeType: DegreeType = DegreeType.MidTerm1;
  classWideAcademicYear: string = new Date().getFullYear().toString();
  isGeneratingClassWide = false;
  isDownloadingClassWide = false;
  
  // Verification
  verifyCertificateId: string = '';
  verifyBy: string = '';

  constructor(
    private classService: ClassService,
    private certificateService: CertificateService,
    private gradeService: GradeService,
    private curriculumService: CurriculumService
  ) {
    this.generateAcademicYears();
  }

  ngOnInit(): void {
    this.loadAllClasses();
    this.loadGrades();
    this.loadCurricula();
  }

  generateAcademicYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      this.academicYears.push(`${year}-${year + 1}`);
    }
  }

  loadAllClasses(): void {
    this.classService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.allClasses = response.data;
          this.filteredClasses = [...this.allClasses];
        }
      },
      error: (error) => {
        this.showMessage('Error loading classes', 'error');
      }
    });
  }

  loadGrades(): void {
    this.gradeService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.grades = response.data;
        }
      },
      error: (error) => {
        this.showMessage('Error loading grades', 'error');
      }
    });
  }

  loadCurricula(): void {
    this.curriculumService.getAll().subscribe({
      next: (curricula) => {
        this.curricula = curricula;
      },
      error: (error) => {
        this.showMessage('Error loading curricula', 'error');
      }
    });
  }

  onCurriculumChange(): void {
    this.selectedGradeId = '';
    this.selectedClassId = '';
    this.students = [];
    this.filteredStudents = [];
    this.filterClasses();
  }

  onGradeChange(): void {
    this.selectedClassId = '';
    this.students = [];
    this.filteredStudents = [];
    this.filterClasses();
  }

  filterClasses(): void {
    if (!this.selectedCurriculumId && !this.selectedGradeId) {
      this.filteredClasses = [...this.allClasses];
      return;
    }

    this.filteredClasses = this.allClasses.filter(classItem => {
      if (this.selectedGradeId) {
        return classItem.gradeId === this.selectedGradeId;
      }
      
      if (this.selectedCurriculumId) {
        const grade = this.grades.find(g => g.id === classItem.gradeId);
        return grade?.curriculumId === this.selectedCurriculumId;
      }
      
      return true;
    });
  }

  onClassChange(): void {
    if (this.selectedClassId) {
      this.loadStudents(this.selectedClassId);
      this.selectedStudentId = '';
    } else {
      this.students = [];
      this.filteredStudents = [];
    }
  }

  loadStudents(classId: string): void {
    this.classService.getStudentsByClass(classId).subscribe({
      next: (response) => {
        if (response.success) {
          this.students = response.data;
          this.filteredStudents = [...this.students];
        }
      },
      error: (error) => {
        this.showMessage('Error loading students', 'error');
      }
    });
  }

  searchStudents(): void {
    if (!this.searchFilters.studentName) {
      this.filteredStudents = [...this.students];
      return;
    }
    
    const searchTerm = this.searchFilters.studentName.toLowerCase();
    this.filteredStudents = this.students.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm) ||
      (student.contactInfo && student.contactInfo.toLowerCase().includes(searchTerm))
    );
  }

  selectStudent(student: StudentModel): void {
    this.selectedStudentId = student.id;
  }

  // ========== SINGLE CERTIFICATE GENERATION ==========

  generateCertificate(saveToDb: boolean): void {
    if (!this.selectedStudentId || !this.selectedDegreeType) {
      this.showMessage('Please select a student and certificate type', 'error');
      return;
    }

    this.isGenerating = true;
    this.message = '';

    const observable = saveToDb
      ? this.certificateService.generateAndSaveCertificate(this.selectedStudentId, this.selectedDegreeType)
      : this.certificateService.generateCertificate(this.selectedStudentId, this.selectedDegreeType);

    observable.subscribe({
      next: (blob) => {
        const fileName = `${this.selectedStudentId}_${this.selectedDegreeType}_certificate.pdf`;
        this.certificateService.downloadPdf(blob, fileName);
        this.showMessage(`Certificate generated successfully${saveToDb ? ' and saved to database' : ''}`, 'success');
        this.isGenerating = false;
      },
      error: (error) => {
        this.showMessage('Error generating certificate: ' + error.message, 'error');
        this.isGenerating = false;
      }
    });
  }

  saveToDatabase(): void {
    if (!this.selectedStudentId || !this.selectedDegreeType) {
      this.showMessage('Please select a student and certificate type', 'error');
      return;
    }

    this.isSaving = true;
    this.message = '';

    this.certificateService.saveCertificateToDb(this.selectedStudentId, this.selectedDegreeType).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Certificate saved to database successfully', 'success');
        } else {
          this.showMessage(response.message || 'Failed to save certificate', 'error');
        }
        this.isSaving = false;
      },
      error: (error) => {
        this.showMessage('Error saving certificate to database: ' + error.message, 'error');
        this.isSaving = false;
      }
    });
  }

  // ========== CLASS-WIDE CERTIFICATE GENERATION ==========
  // NEW: Generate certificates for ALL students in the selected class

  generateClassWideCertificates(): void {
    if (!this.selectedClassId || !this.classWideDegreeType) {
      this.showMessage('Please select a class and certificate type', 'error');
      return;
    }

    this.isGeneratingClassWide = true;
    this.message = '';

    console.log('Generating certificates for class:', {
      classId: this.selectedClassId,
      degreeType: this.classWideDegreeType,
      academicYear: this.classWideAcademicYear
    });

    this.certificateService.bulkGenerateForClass(
      this.selectedClassId,
      this.classWideDegreeType,
      this.classWideAcademicYear
    ).subscribe({
      next: (response) => {
        console.log('Bulk generation response:', response);
        if (response.success) {
          this.showMessage(`Class-wide certificates generated successfully: ${response.message}`, 'success');
        } else {
          this.showMessage(response.message || 'Class-wide generation failed', 'error');
        }
        this.isGeneratingClassWide = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Bulk generation error:', error);
        
        // Provide more detailed error message
        let errorMessage = 'Error during class-wide generation: ';
        
        if (error.status === 400) {
          errorMessage += 'Bad Request. Please check the input parameters.';
          if (error.error) {
            errorMessage += ` Details: ${JSON.stringify(error.error)}`;
          }
        } else if (error.status === 404) {
          errorMessage += 'Endpoint not found. Please check the API URL.';
        } else if (error.status === 500) {
          errorMessage += 'Internal server error. Please try again later.';
        } else {
          errorMessage += error.message;
        }
        
        this.showMessage(errorMessage, 'error');
        this.isGeneratingClassWide = false;
      }
    });
  }

  downloadClassWideCertificates(): void {
    if (!this.selectedClassId || !this.classWideDegreeType) {
      this.showMessage('Please select a class and certificate type', 'error');
      return;
    }

    this.isDownloadingClassWide = true;
    this.message = '';

    console.log('Downloading certificates for class:', {
      classId: this.selectedClassId,
      degreeType: this.classWideDegreeType,
      academicYear: this.classWideAcademicYear
    });

    this.certificateService.downloadBulkCertificatesForClass(
      this.selectedClassId,
      this.classWideDegreeType,
      this.classWideAcademicYear
    ).subscribe({
      next: (blob) => {
        const fileName = `certificates_class_${this.selectedClassId}_${this.classWideDegreeType}.zip`;
        this.certificateService.downloadZip(blob, fileName);
        this.showMessage('Class-wide certificates downloaded successfully', 'success');
        this.isDownloadingClassWide = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Download error:', error);
        
        let errorMessage = 'Error downloading class-wide certificates: ';
        
        if (error.status === 400) {
          errorMessage += 'Bad Request. Please check the input parameters.';
        } else if (error.status === 404) {
          errorMessage += 'Endpoint not found. Please check the API URL.';
        } else if (error.status === 500) {
          errorMessage += 'Internal server error. Please try again later.';
        } else {
          errorMessage += error.message;
        }
        
        this.showMessage(errorMessage, 'error');
        this.isDownloadingClassWide = false;
      }
    });
  }

  // ========== BULK OPERATIONS (For Bulk Tab) ==========

  bulkGenerateCertificates(): void {
    if (!this.bulkClassId || !this.bulkDegreeType) {
      this.showMessage('Please select a class and certificate type', 'error');
      return;
    }

    this.isBulkGenerating = true;
    this.message = '';

    this.certificateService.bulkGenerateForClass(
      this.bulkClassId,
      this.bulkDegreeType,
      this.bulkAcademicYear
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage(`Bulk certificate generation completed: ${response.message}`, 'success');
        } else {
          this.showMessage(response.message || 'Bulk generation failed', 'error');
        }
        this.isBulkGenerating = false;
      },
      error: (error) => {
        this.showMessage('Error during bulk generation: ' + error.message, 'error');
        this.isBulkGenerating = false;
      }
    });
  }

  downloadBulkCertificates(): void {
    if (!this.bulkClassId || !this.bulkDegreeType) {
      this.showMessage('Please select a class and certificate type', 'error');
      return;
    }

    this.isDownloadingBulk = true;
    this.message = '';

    this.certificateService.downloadBulkCertificatesForClass(
      this.bulkClassId,
      this.bulkDegreeType,
      this.bulkAcademicYear
    ).subscribe({
      next: (blob) => {
        const fileName = `certificates_class_${this.bulkClassId}_${this.bulkDegreeType}.zip`;
        this.certificateService.downloadZip(blob, fileName);
        this.showMessage('Bulk certificates downloaded successfully', 'success');
        this.isDownloadingBulk = false;
      },
      error: (error) => {
        this.showMessage('Error downloading bulk certificates: ' + error.message, 'error');
        this.isDownloadingBulk = false;
      }
    });
  }

  // ========== SEARCH FUNCTIONALITY ==========

  searchCertificates(): void {
    this.isSearching = true;
    this.certificateService.searchCertificates(this.searchFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.certificates = response.data || [];
          this.showMessage(`Found ${this.certificates.length} certificates`, 'success');
        } else {
          this.showMessage(response.message || 'Search failed', 'error');
        }
        this.isSearching = false;
      },
      error: (error) => {
        this.showMessage('Error searching certificates: ' + error.message, 'error');
        this.isSearching = false;
      }
    });
  }

  clearSearch(): void {
    this.searchFilters = {};
    this.certificates = [];
  }

  // ========== CERTIFICATE MANAGEMENT ==========

  viewCertificate(certificate: Certificate): void {
    if (!certificate.id || !certificate.studentId || !certificate.degreeType) {
      this.showMessage('Cannot view certificate: missing data', 'error');
      return;
    }

    this.certificateService.getCertificateFromDb(certificate.studentId, certificate.degreeType).subscribe({
      next: (blob) => {
        this.certificateService.openPdfInNewTab(blob);
      },
      error: (error) => {
        this.showMessage('Error viewing certificate: ' + error.message, 'error');
      }
    });
  }

  downloadCertificate(certificate: Certificate): void {
    if (!certificate.id || !certificate.studentId || !certificate.degreeType) {
      this.showMessage('Cannot download certificate: missing data', 'error');
      return;
    }

    this.certificateService.getCertificateFromDb(certificate.studentId, certificate.degreeType).subscribe({
      next: (blob) => {
        const fileName = certificate.fileName || `${certificate.studentId}_${certificate.degreeType}.pdf`;
        this.certificateService.downloadPdf(blob, fileName);
      },
      error: (error) => {
        this.showMessage('Error downloading certificate: ' + error.message, 'error');
      }
    });
  }

  verifyCertificate(): void {
    if (!this.verifyCertificateId || !this.verifyBy) {
      this.showMessage('Please enter certificate ID and verifier name', 'error');
      return;
    }

    this.certificateService.verifyCertificate(this.verifyCertificateId, this.verifyBy).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Certificate verified successfully', 'success');
          this.verifyCertificateId = '';
          this.verifyBy = '';
          // Refresh search results if on search tab
          if (this.activeTab === 'search') {
            this.searchCertificates();
          }
        } else {
          this.showMessage(response.message || 'Verification failed', 'error');
        }
      },
      error: (error) => {
        this.showMessage('Error verifying certificate: ' + error.message, 'error');
      }
    });
  }

  archiveCertificate(certificateId: string): void {
    if (!confirm('Are you sure you want to archive this certificate? This action cannot be undone.')) {
      return;
    }

    this.certificateService.archiveCertificate(certificateId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Certificate archived successfully', 'success');
          // Refresh search results
          if (this.activeTab === 'search') {
            this.searchCertificates();
          }
        } else {
          this.showMessage(response.message || 'Archiving failed', 'error');
        }
      },
      error: (error) => {
        this.showMessage('Error archiving certificate: ' + error.message, 'error');
      }
    });
  }

  // ========== UTILITY METHODS ==========

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  getVerificationStatus(certificate: Certificate): string {
    if (certificate.archived) return 'Archived';
    if (certificate.verified) return 'Verified';
    return 'Pending';
  }

  getVerificationClass(certificate: Certificate): string {
    if (certificate.archived) return 'badge-secondary';
    if (certificate.verified) return 'badge-success';
    return 'badge-warning';
  }

  switchTab(tab: 'generate' | 'search' | 'bulk'): void {
    this.activeTab = tab;
    if (tab === 'search') {
      this.clearSearch();
    }
  }

  // Get filtered classes for bulk operations
  getBulkFilteredClasses(): ClassViewDto[] {
    return this.filteredClasses;
  }

  // NEW: Helper method to check if a class is selected in Generate tab
  isClassSelected(): boolean {
    return !!this.selectedClassId;
  }

  // NEW: Helper method to get student count
  getStudentCount(): number {
    return this.students.length;
  }
}