import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherService } from '../../../../../Services/teacher.service';
import { ServiceResult, TeacherViewDto } from '../../../../../Interfaces/iteacher';
import { SubjectViewDto } from '../../../../../Interfaces/isubject';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { AfterAuthService } from '../../../../../Services/after-auth.service';
import { FileService } from '../../../../../Services/file.service';
import { AuthResponse } from '../../../../../Interfaces/iafter-auth';
import { ImageService } from '../../../../../Services/image.service';
import { AuthService } from '../../../../../Services/auth.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit {
  // User Profile Data from getCurrentUser()
  userProfile: AuthResponse | null = null;
  
  // Teacher Specific Data
  teacherDetails: TeacherViewDto | null = null;
  teacherSubjects: SubjectViewDto[] = [];
  teacherClasses: ClassViewDto[] = [];
  
  // UI State
  loading = true;
  isUploading = false;
  uploadProgress = 0;
  
  // Toast Notification
  showToast = false;
  toastTitle = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  
  // Stats
  totalSubjects = 0;
  totalClasses = 0;
  totalSpecializations = 0;
  totalStudents = 0;
  
  // Computed Properties
  get teacherId(): string | null {
    if (this.userProfile?.roleEntityIds?.['teacherId']) {
      return this.userProfile.roleEntityIds['teacherId'];
    }
    return localStorage.getItem('teacherId');
  }
  
  get teacherIdShort(): string {
    if (!this.userProfile?.userId) return 'N/A';
    return this.userProfile.userId.substring(0, 8);
  }
  
  get teacherSubjectNames(): string[] {
    return this.teacherSubjects.map(s => s.subjectName || 'Unnamed Subject');
  }
  
  get teacherClassNames(): string[] {
    return this.teacherClasses.map(c => c.className || 'Unnamed Class');
  }
  
  // Selected file for upload
  private selectedFile: File | null = null;

  constructor(
    private teacherService: TeacherService,
    private afterAuthService: AfterAuthService,
    private fileService: FileService,
    private imageService: ImageService,
    private AuthService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Load current user profile from AfterAuthService
   */
  loadUserProfile(): void {
    this.loading = true;
    
    this.afterAuthService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userProfile = response.data;
          console.log('User Profile Loaded:', this.userProfile);

          this.loadProfileImage();
          
          // Check if user is a teacher
          if (this.userProfile.roles.includes('teacher') || this.userProfile.roles.includes('Teacher')) {
            this.loadTeacherData();
          } else {
            this.showError('You are not registered as a teacher');
            this.loading = false;
          }
        } else {
          this.showError(response.message || 'Failed to load profile');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.showError('Failed to load user profile. Please try again.');
        this.loading = false;
      }
    });
  }

  /**
   * Load teacher-specific data using the teacherId from roleEntityIds
   */
  loadTeacherData(): void {
    if (!this.teacherId) {
      this.showError('Teacher ID not found');
      this.loading = false;
      return;
    }

    // Load teacher details
    this.teacherService.getById(this.teacherId).subscribe({
      next: (res: ServiceResult<TeacherViewDto>) => {
        if (res.success && res.data) {
          this.teacherDetails = res.data;
          this.calculateStats();
        }
      },
      error: (err: any) => {
        console.error('Failed to load teacher details:', err);
      },
      complete: () => {
        this.loadAdditionalTeacherData();
      }
    });
  }

  /**
   * Load additional teacher data (subjects and classes)
   */
  loadAdditionalTeacherData(): void {
    if (!this.teacherId) {
      this.loading = false;
      return;
    }

    // Load teacher subjects
    this.teacherService.getTeacherSubjects(this.teacherId).subscribe({
      next: (res: ServiceResult<SubjectViewDto[]>) => {
        if (res.success && res.data) {
          this.teacherSubjects = res.data;
          this.totalSubjects = this.teacherSubjects.length;
        }
      },
      error: (err: any) => {
        console.error('Failed to load teacher subjects:', err);
      }
    });

    // Load teacher classes
    this.teacherService.getTeacherClasses(this.teacherId).subscribe({
      next: (res: ServiceResult<ClassViewDto[]>) => {
        if (res.success && res.data) {
          this.teacherClasses = res.data;
          this.totalClasses = this.teacherClasses.length;
          this.calculateStudentCount();
        }
      },
      error: (err: any) => {
        console.error('Failed to load teacher classes:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Calculate statistics based on loaded data
   */
  calculateStats(): void {
    if (this.teacherDetails) {
      this.totalSubjects = this.teacherDetails.subjects?.length || 0;
      this.totalClasses = this.teacherDetails.classNames?.length || 0;
      this.totalSpecializations = this.teacherDetails.specializedCurriculumIds?.length || 0;
    }
  }

  /**
   * Calculate total students from classes
   */
  calculateStudentCount(): void {
    this.totalStudents = this.teacherClasses.reduce((total, classItem) => {
      return total + (classItem.studentCount || 0);
    }, 0);
  }

  /**
   * Get profile image URL with proper handling
   */
  getProfileImageUrl(): string {
    if (!this.userProfile?.profileImageUrl) {
      console.log('No profile image URL, using default');
      return this.imageService.getDefaultAvatarUrl();
    }
    
    // Get the URL from image service
    const url = this.imageService.getImageUrl(this.userProfile.profileImageUrl);
    console.log('Profile image URL:', url);
    return url;
  }

loadProfileImage(): void {
    // Optional: You can remove this method entirely
    // Or keep it simple without checking
    if (this.userProfile?.profileImageUrl) {
      console.log('Profile image path:', this.userProfile.profileImageUrl);
    }
  }

  /**
   * Handle image loading errors
   */
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

  /**
   * Trigger file input for profile image upload
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Handle profile image selection
   */
  onProfileImageSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.showError('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showError('File size must be less than 5MB');
      return;
    }

    this.selectedFile = file;
    this.uploadProfileImage();
  }

  /**
   * Upload profile image to server
   */
  uploadProfileImage(): void {
  if (!this.selectedFile) {
    return;
  }

  console.log('=== UPLOAD DEBUG INFO ===');
  console.log('File name:', this.selectedFile.name);
  console.log('File type:', this.selectedFile.type);
  console.log('File size:', this.selectedFile.size);
  console.log('Token exists:', !!this.AuthService.getToken());
  console.log('=======================');

  this.isUploading = true;
  this.uploadProgress = 0;

  this.afterAuthService.uploadProfilePhoto(this.selectedFile).subscribe({
    next: (response) => {
      console.log('Response received:', response);
      if (response.success && response.data) {
        this.userProfile = response.data;
        this.showSuccess('Profile photo updated successfully');
        
        // Force refresh after successful upload
        setTimeout(() => {
          this.refreshProfile();
        }, 1000);
      } else {
        this.showError(response.message || 'Failed to upload profile photo');
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
      let errorMessage = 'Failed to upload profile photo';
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

  // Remove the simulated progress for now
  // this.simulateUploadProgress();
}

  /**
   * Simulate upload progress (for UI feedback)
   */
  private simulateUploadProgress(): void {
    const interval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      } else {
        clearInterval(interval);
      }
    }, 200);
  }

  /**
   * Reset file input
   */
  private resetFileInput(): void {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Refresh profile data
   */
  refreshProfile(): void {
    this.loadUserProfile();
  }

  /**
   * Open profile settings (placeholder)
   */
  openProfileSettings(): void {
    // Navigate to profile settings page or open modal
    console.log('Opening profile settings...');
    this.showInfo('Profile settings feature coming soon');
  }

  /**
   * View all subjects
   */
  viewAllSubjects(): void {
    // Navigate to subjects page or open modal
    console.log('Viewing all subjects...');
    this.showInfo('Subjects list feature coming soon');
  }

  /**
   * View all classes
   */
  viewAllClasses(): void {
    // Navigate to classes page or open modal
    console.log('Viewing all classes...');
    this.showInfo('Classes list feature coming soon');
  }

  /**
   * Format list for display
   */
  formatList(items: string[]): string {
    if (!items || items.length === 0) return 'None';
    if (items.length <= 3) return items.join(', ');
    return `${items.slice(0, 3).join(', ')} +${items.length - 3} more`;
  }

  /**
   * Get account status color
   */
  getAccountStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      case 'suspended': 
      case 'rejected': 
      case 'banned': return 'danger';
      default: return 'info';
    }
  }

  /**
   * Get account status text
   */
  getAccountStatusText(status: string): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Show success toast
   */
  private showSuccess(message: string): void {
    this.showToastMessage('Success', message, 'success');
  }

  /**
   * Show error toast
   */
  private showError(message: string): void {
    this.showToastMessage('Error', message, 'error');
  }

  /**
   * Show info toast
   */
  private showInfo(message: string): void {
    this.showToastMessage('Info', message, 'success');
  }

  /**
   * Show toast message
   */
  private showToastMessage(title: string, message: string, type: 'success' | 'error'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  /**
   * Hide toast
   */
  hideToast(): void {
    this.showToast = false;
  }
}