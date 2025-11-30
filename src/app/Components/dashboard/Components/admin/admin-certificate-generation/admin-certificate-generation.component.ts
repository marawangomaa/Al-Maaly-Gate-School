import { Component } from '@angular/core';
import { StudentModel } from '../../../../../Interfaces/istudent';
import { ClassService } from '../../../../../Services/class.service';
import { CertificateService } from '../../../../../Services/certificate.service';
import { DegreeType } from '../../../../../Interfaces/icertificate';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-certificate-generation',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-certificate-generation.component.html',
  styleUrl: './admin-certificate-generation.component.css'
})
export class AdminCertificateGenerationComponent {
  classes: ClassViewDto[] = [];
  students: StudentModel[] = [];
  selectedClassId: string = '';
  selectedStudentId: string = '';
  selectedDegreeType: DegreeType = DegreeType.MidTerm1;
  
  isGenerating = false;
  isSaving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  degreeTypes = Object.values(DegreeType);

  constructor(
    private classService: ClassService,
    private certificateService: CertificateService
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.classService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.classes = response.data;
        }
      },
      error: (error) => {
        this.showMessage('Error loading classes', 'error');
      }
    });
  }

  onClassChange(): void {
    if (this.selectedClassId) {
      this.loadStudents(this.selectedClassId);
      this.selectedStudentId = '';
    } else {
      this.students = [];
    }
  }

  loadStudents(classId: string): void {
    this.classService.getStudentsByClass(classId).subscribe({
      next: (response) => {
        if (response.success) {
          this.students = response.data;
        }
      },
      error: (error) => {
        this.showMessage('Error loading students', 'error');
      }
    });
  }

  selectStudent(student: StudentModel): void {
    this.selectedStudentId = student.id;
  }

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
          this.showMessage(response.message, 'error');
        }
        this.isSaving = false;
      },
      error: (error) => {
        this.showMessage('Error saving certificate to database: ' + error.message, 'error');
        this.isSaving = false;
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
