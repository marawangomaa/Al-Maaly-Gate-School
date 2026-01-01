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

@Component({
  selector: 'app-children-of-parent',
  imports: [CommonModule, FormsModule],
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
    @Inject(PLATFORM_ID) private platformId: Object
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
      this.error = 'Failed to load user data';
      this.isLoading = false;
    }
  }

  loadParentWithChildren(): void {
    if (!this.parentId) {
      this.error = 'Parent ID is required';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.parentService.getParentWithChildren(this.parentId).subscribe({
      next: (response: ApiResponse<iparentViewWithChildrenDto>) => {
        if (response.success && response.data) {
          this.parent = response.data;
        } else {
          this.error = response.message || 'Failed to load parent information';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'An error occurred while loading parent information';
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

          console.log(`Found ${this.studentCertificates.length} certificates`);
          console.log(`Degree types: ${this.degreeTypes.join(', ')}`);
        } else {
          console.error('Failed to load student certificates:', response.message);
          this.studentCertificates = [];
          this.filteredCertificates = [];
        }
        this.loadingCertificates = false;
      },
      error: (err) => {
        console.error('An error occurred while loading student certificates:', err);
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
      alert('PDF data is not available for this certificate');
    }
  }

  downloadAllCertificates(student: istudentMinimalDto): void {
    if (!this.studentCertificates || this.studentCertificates.length === 0) {
      alert('No certificates to download');
      return;
    }

    // For now, just download the first available certificate
    // In a real app, you might want to create a zip file or download individually
    const firstCertificate = this.studentCertificates.find(c => c.pdfData);
    if (firstCertificate) {
      this.downloadCertificate(firstCertificate);
    } else {
      alert('No certificates with PDF data available for download');
    }
  }

  previewCertificate(certificate: Certificate): void {
    if (certificate.pdfData) {
      const pdfArray = new Uint8Array(certificate.pdfData);
      const blob = new Blob([pdfArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      alert('PDF preview is not available for this certificate');
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