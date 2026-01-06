import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../../../Services/student.service';
import { istudentProfile } from '../../../../../Interfaces/istudentProfile';
import { istudentExamResults } from '../../../../../Interfaces/istudentExamResults';
import { AfterAuthService } from '../../../../../Services/after-auth.service';
import { ImageService } from '../../../../../Services/image.service';
import { AuthService } from '../../../../../Services/auth.service';
import { AuthResponse } from '../../../../../Interfaces/iafter-auth';
import { AccountStatus } from '../../../../../Interfaces/AccountStatus';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  private studentService = inject(StudentService);
  private afterAuthService = inject(AfterAuthService);
  private imageService = inject(ImageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  // User Profile Data from getCurrentUser()
  userProfile: AuthResponse | null = null;

  // Student Specific Data
  studentProfile: istudentProfile | null = null;
  examResults: istudentExamResults[] = [];

  // UI states
  loading = true;
  loadingExams = false;
  isUploading = false;
  uploadProgress = 0;

  // Selected file for upload
  private selectedFile: File | null = null;

  // Toast notifications
  showToast = false;
  toastTitle = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Stats
  totalExams = 0;
  averageScore = 0;
  highestScore = 0;
  lowestScore = 100;
  subjectsSet = new Set<string>();

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Computed properties
  get studentId(): string | null {
    if (this.userProfile?.roleEntityIds?.['studentId']) {
      return this.userProfile.roleEntityIds['studentId'];
    }
    return localStorage.getItem('studentId');
  }

  get recentExams(): istudentExamResults[] {
    return this.examResults.slice(0, 4);
  }

  get uniqueSubjects(): string[] {
    return Array.from(this.subjectsSet);
  }

  get formattedParentNames(): string {
    if (!this.studentProfile?.parents?.length) return this.translate.instant('STUDENT_OVERVIEW.NO_PARENTS');

    return this.studentProfile.parents
      .map((parent: any) => parent.fullName || parent.name)
      .join(', ');
  }

  // Main loading methods
  loadUserProfile(): void {
    this.loading = true;

    this.afterAuthService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userProfile = response.data;
          console.log('User Profile Loaded:', this.userProfile);

          // Check if user is a student
          if (this.userProfile.roles.includes('student') || this.userProfile.roles.includes('Student')) {
            this.loadStudentData();
          } else {
            this.showError(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.NOT_REGISTERED_AS_STUDENT'));
            this.loading = false;
          }
        } else {
          this.showError(response.message || this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.FAILED_TO_LOAD_PROFILE'));
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.showError(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.GENERIC_ERROR'));
        this.loading = false;
      }
    });
  }

  loadStudentData(): void {
    if (!this.studentId) {
      this.showError(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.STUDENT_ID_NOT_FOUND'));
      this.loading = false;
      return;
    }

    // Load student details
    this.studentService.GetStudentEntity(this.studentId).subscribe({
      next: (response) => {
        if (response.data) {
          this.studentProfile = response.data;
          localStorage.setItem('studentClassId', this.studentProfile?.classId || '');
          this.loadExamResults();
        } else {
          this.showError(response.message || this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.FAILED_TO_LOAD_STUDENT_DETAILS'));
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Failed to load student details:', error);
        this.showError(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.FAILED_TO_LOAD_STUDENT_DETAILS'));
        this.loading = false;
      }
    });
  }

  loadExamResults(): void {
    if (!this.studentId) {
      this.loading = false;
      return;
    }

    this.loadingExams = true;
    this.studentService.GetStudentExamsResults(this.studentId).subscribe({
      next: (response) => {
        if (response.data) {
          this.examResults = response.data;
          this.calculateStats();
        }
        this.loading = false;
        this.loadingExams = false;
      },
      error: (error) => {
        console.error('Error loading exam results:', error);
        this.showError(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.FAILED_TO_LOAD_EXAM_RESULTS'));
        this.loading = false;
        this.loadingExams = false;
      }
    });
  }

  calculateStats(): void {
    if (!this.examResults.length) return;

    this.totalExams = this.examResults.length;

    // Calculate average, highest, and lowest scores
    const scores = this.examResults.map(exam => exam.percentage);
    this.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    this.highestScore = Math.max(...scores);
    this.lowestScore = Math.min(...scores);

    // Collect unique subjects
    this.examResults.forEach(exam => {
      if (exam.subjectName) {
        this.subjectsSet.add(exam.subjectName);
      }
    });
  }

  // Image handling methods
  getProfileImageUrl(): string {
    if (!this.userProfile?.profileImageUrl) {
      return this.imageService.getDefaultAvatarUrl();
    }

    // Get the URL from image service
    const url = this.imageService.getImageUrl(this.userProfile.profileImageUrl);
    return url;
  }

  handleImageError(event: any): void {
    console.log('Image load error, switching to fallback');

    // Only change if not already the fallback
    const currentSrc = event.target.src;
    const fallbackUrl = this.imageService.getDefaultAvatarUrl();

    if (!currentSrc.includes('default-avatar')) {
      event.target.src = fallbackUrl;
      // Prevent further errors
      event.target.onerror = null;
    }
  }

  handleImageLoad(event: any): void {
    console.log('Image loaded successfully');
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onProfileImageSelected(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.showError(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.VALIDATION.FILE_TYPE_RESTRICTION'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showError(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.VALIDATION.FILE_SIZE_RESTRICTION'));
      return;
    }

    this.selectedFile = file;
    this.uploadProfileImage();
  }

  uploadProfileImage(): void {
    if (!this.selectedFile) {
      return;
    }

    console.log('=== UPLOAD DEBUG INFO ===');
    console.log('File name:', this.selectedFile.name);
    console.log('File type:', this.selectedFile.type);
    console.log('File size:', this.selectedFile.size);
    console.log('Token exists:', !!this.authService.getToken());
    console.log('=======================');

    this.isUploading = true;
    this.uploadProgress = 0;

    this.afterAuthService.uploadProfilePhoto(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Response received:', response);
        if (response.success && response.data) {
          this.userProfile = response.data;
          this.showSuccess(this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.SUCCESS.PROFILE_PHOTO_UPDATED'));

          // Force refresh after successful upload
          setTimeout(() => {
            this.refreshProfile();
          }, 1000);
        } else {
          this.showError(response.message || this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.FAILED_TO_UPLOAD_PROFILE_PHOTO'));
        }
        this.isUploading = false;
        this.selectedFile = null;
        this.resetFileInput();
      },
      error: (error) => {
        console.error('Upload error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          headers: error.headers
        });

        // Get the actual error message from the response
        let errorMessage = this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.ERRORS.FAILED_TO_UPLOAD_PROFILE_PHOTO');
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        this.showError(errorMessage);
        this.isUploading = false;
        this.selectedFile = null;
        this.resetFileInput();
      }
    });

    // Simulate upload progress
    this.simulateUploadProgress();
  }

  private simulateUploadProgress(): void {
    const interval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      } else {
        clearInterval(interval);
      }
    }, 200);
  }

  private resetFileInput(): void {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Helper methods
  formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      return this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.VALIDATION.INVALID_DATE');
    }

    return date.toLocaleDateString();
  }

  formatScore(score: number): string {
    return `${score}%`;
  }

  getGradeColor(score: number): string {
    if (score >= 90) return 'success';
    if (score >= 75) return 'primary';
    if (score >= 60) return 'warning';
    return 'danger';
  }

  getGradeText(score: number): string {
    if (score >= 90) return this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.GRADES.A');
    if (score >= 80) return this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.GRADES.B');
    if (score >= 70) return this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.GRADES.C');
    if (score >= 60) return this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.GRADES.D');
    return this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.GRADES.F');
  }

  get accountStatusColor(): string {
    switch (this.studentProfile?.accountStatus) {
      case AccountStatus.Active: return 'success';
      case AccountStatus.Pending: return 'warning';
      case AccountStatus.Rejected: return 'danger';
      case AccountStatus.Blocked: return 'secondary';
      default: return 'secondary';
    }
  }

  get accountStatusText(): string {
    if (!this.userProfile?.accountStatus) return this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.STATUS.UNKNOWN');
    
    const statusMap: { [key: string]: string } = {
      'Active': this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.STATUS.ACTIVE'),
      'Pending': this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.STATUS.PENDING'),
      'Rejected': this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.STATUS.REJECTED'),
      'Blocked': this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.STATUS.BLOCKED')
    };
    
    return statusMap[this.userProfile.accountStatus] || this.userProfile.accountStatus;
  }

  // Navigation methods
  viewAllExams(): void {
    this.router.navigate(['/student/exams']);
  }

  viewExamDetails(examId: string): void {
    if (this.studentId) {
      this.router.navigate(['/student/exam', this.studentId, examId]);
    }
  }

  openProfileSettings(): void {
    this.router.navigate(['/student/settings']);
  }

  refreshProfile(): void {
    this.loadUserProfile();
  }

  // Toast notification methods
  private showSuccess(message: string): void {
    this.showToastMessage(
      this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.TOAST.SUCCESS_TITLE'),
      message,
      'success'
    );
  }

  private showError(message: string): void {
    this.showToastMessage(
      this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.TOAST.ERROR_TITLE'),
      message,
      'error'
    );
  }

  private showInfo(message: string): void {
    this.showToastMessage(
      this.translate.instant('STUDENT_OVERVIEW.TS_MESSAGES.TOAST.INFO_TITLE'),
      message,
      'success'
    );
  }

  private showToastMessage(title: string, message: string, type: 'success' | 'error'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast(): void {
    this.showToast = false;
  }
}