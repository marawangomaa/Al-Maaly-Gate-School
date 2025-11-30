import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Certificate, DegreeType } from '../../../../../Interfaces/icertificate';
import { CertificateService } from '../../../../../Services/certificate.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-student-certificates',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './student-certificates.component.html',
  styleUrl: './student-certificates.component.css'
})
export class StudentCertificatesComponent {
  certificates: Certificate[] = [];
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private certificateService: CertificateService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading = true;
    this.certificateService.getMyCertificates().subscribe({
      next: (response) => {
        if (response.success) {
          this.certificates = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Error loading certificates: ' + error.message, 'error');
        this.isLoading = false;
      }
    });
  }

  viewCertificate(certificate: Certificate): void {
    this.certificateService.getCertificateFromDb(certificate.studentId, certificate.degreeType).subscribe({
      next: (blob) => {
        this.certificateService.openPdfInNewTab(blob);
      },
      error: (error) => {
        this.showMessage('Error loading certificate: ' + error.message, 'error');
      }
    });
  }

  downloadCertificate(certificate: Certificate): void {
    this.certificateService.getCertificateFromDb(certificate.studentId, certificate.degreeType).subscribe({
      next: (blob) => {
        this.certificateService.downloadPdf(blob, certificate.fileName);
        this.showMessage('Certificate downloaded successfully', 'success');
      },
      error: (error) => {
        this.showMessage('Error downloading certificate: ' + error.message, 'error');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
