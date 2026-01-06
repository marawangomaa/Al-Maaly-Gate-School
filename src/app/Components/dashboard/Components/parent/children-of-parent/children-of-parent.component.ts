import { isBrowser } from './../../../../../utils/storage.util';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iparentViewWithChildrenDto } from '../../../../../Interfaces/iparentViewWithChildrenDto';
import { ParentService } from '../../../../../Services/parent.service';
import { istudentMinimalDto } from '../../../../../Interfaces/istudentMinimalDto';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { CertificateService } from '../../../../../Services/certificate.service';
import { Certificate } from '../../../../../Interfaces/icertificate';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-children-of-parent',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './children-of-parent.component.html',
  styleUrls: ['./children-of-parent.component.css']
})
export class ChildrenOfParentComponent implements OnInit {
  parent: iparentViewWithChildrenDto | null = null;
  selectedStudent: istudentMinimalDto | null = null;
  studentCertificates: Certificate[] = [];
  filteredCertificates: Certificate[] = [];
  selectedCertificate: Certificate | null = null;

  isLoading = true;
  loadingCertificates = false;
  error = '';
  parentId = '';
  isBrowser: boolean = false;

  // Filter properties
  selectedDegreeType: string = 'all';
  showVerifiedOnly: boolean = false;
  degreeTypes: string[] = [];

  constructor(
    private parentService: ParentService,
    private certificateService: CertificateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          this.parentId = userData.parentId;
          this.loadParentWithChildren();
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.error = this.translate.instant('PARENT_CHILDREN_TS.ERRORS.PARSING_ERROR');
      this.isLoading = false;
    }
  }

  loadParentWithChildren(): void {
    if (!this.parentId) {
      this.error = this.translate.instant('PARENT_CHILDREN_TS.ERRORS.PARENT_ID_REQUIRED');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.parentService.getParentWithChildren(this.parentId).subscribe({
      next: (response: ApiResponse<iparentViewWithChildrenDto>) => {
        if (response.success && response.data) {
          this.parent = response.data;
        } else {
          this.error = response.message || this.translate.instant('PARENT_CHILDREN_TS.ERRORS.LOAD_PARENT_FAILED');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = this.translate.instant('PARENT_CHILDREN_TS.ERRORS.GENERIC_ERROR');
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  viewStudentCertificates(student: istudentMinimalDto): void {
    this.selectedStudent = student;
    this.selectedCertificate = null;
    this.loadingCertificates = true;

    this.certificateService.getStudentCertificates(student.id).subscribe({
      next: (response: ApiResponse<Certificate[]>) => {
        if (response.success && response.data) {
          console.log("Student Certificates >>>", response.data);
          this.studentCertificates = response.data;
          this.filteredCertificates = [...this.studentCertificates];

          // Extract unique degree types
          this.degreeTypes = [...new Set(this.studentCertificates.map(c => c.degreeType))];

          console.log(this.translate.instant('PARENT_CHILDREN_TS.SUCCESS.CERTIFICATES_LOADED', { count: this.studentCertificates.length }));
          console.log(this.translate.instant('PARENT_CHILDREN_TS.SUCCESS.DEGREE_TYPES') + ': ' + this.degreeTypes.join(', '));
        } else {
          console.error(this.translate.instant('PARENT_CHILDREN_TS.ERRORS.LOAD_CERTIFICATES_FAILED') + ':', response.message);
          this.studentCertificates = [];
          this.filteredCertificates = [];
        }
        this.loadingCertificates = false;
      },
      error: (err) => {
        console.error(this.translate.instant('PARENT_CHILDREN_TS.ERRORS.GENERIC_CERTIFICATES_ERROR') + ':', err);
        this.loadingCertificates = false;
        this.studentCertificates = [];
        this.filteredCertificates = [];
      }
    });
  }

  // Getter for verified certificates count
  get verifiedCertificatesCount(): number {
    return this.studentCertificates?.filter(c => c.verified).length || 0;
  }

  // Getter for archived certificates count
  get archivedCertificatesCount(): number {
    return this.studentCertificates?.filter(c => c.archived).length || 0;
  }

  filterCertificates(): void {
    this.filteredCertificates = this.studentCertificates.filter(certificate => {
      // Filter by degree type
      if (this.selectedDegreeType !== 'all' && certificate.degreeType !== this.selectedDegreeType) {
        return false;
      }

      // Filter by verified status
      if (this.showVerifiedOnly && !certificate.verified) {
        return false;
      }

      return true;
    });
  }

  viewCertificateDetails(certificate: Certificate): void {
    this.selectedCertificate = certificate;
    console.log('Certificate details:', certificate);
  }

  downloadCertificate(certificate: Certificate): void {
    if (certificate.pdfData) {
      // Convert Uint8Array to Blob
      const pdfArray = new Uint8Array(certificate.pdfData);
      const blob = new Blob([pdfArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = certificate.fileName || `certificate_${certificate.certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);
    } else {
      console.warn('No PDF data available for this certificate');
      alert(this.translate.instant('PARENT_CHILDREN_TS.ERRORS.NO_PDF_DATA'));
    }
  }

  downloadAllCertificates(student: istudentMinimalDto): void {
    if (!this.studentCertificates || this.studentCertificates.length === 0) {
      alert(this.translate.instant('PARENT_CHILDREN_TS.ERRORS.NO_CERTIFICATES_DOWNLOAD'));
      return;
    }

    // For now, just download the first available certificate
    // In a real app, you might want to create a zip file or download individually
    const firstCertificate = this.studentCertificates.find(c => c.pdfData);
    if (firstCertificate) {
      this.downloadCertificate(firstCertificate);
    } else {
      alert(this.translate.instant('PARENT_CHILDREN_TS.ERRORS.NO_PDF_DATA_AVAILABLE'));
    }
  }

  previewCertificate(certificate: Certificate): void {
    if (certificate.pdfData) {
      const pdfArray = new Uint8Array(certificate.pdfData);
      const blob = new Blob([pdfArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      alert(this.translate.instant('PARENT_CHILDREN_TS.ERRORS.PDF_PREVIEW_UNAVAILABLE'));
    }
  }

  onStudentSelect(student: istudentMinimalDto): void {
    this.selectedStudent = student;
    this.selectedCertificate = null;
    console.log('Selected student:', student);
    // You can add more functionality here for viewing student details
  }

  clearCertificateView(): void {
    this.selectedStudent = null;
    this.selectedCertificate = null;
    this.studentCertificates = [];
    this.filteredCertificates = [];
  }
}