import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherService } from '../../../../../Services/teacher.service';
import { ServiceResult, TeacherViewDto } from '../../../../../Interfaces/iteacher';
import { SubjectViewDto } from '../../../../../Interfaces/isubject';
import { ClassViewDto } from '../../../../../Interfaces/iclass';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit {
  teacher: TeacherViewDto | null = null;
  teacherDetails: any = null;
  teacherSubjects: SubjectViewDto[] = [];
  teacherClasses: ClassViewDto[] = [];
  loading = true;
  teacherId: string | null = null;

  // Stats
  totalSubjects = 0;
  totalClasses = 0;
  totalSpecializations = 0;
  totalStudents = 0;

  constructor(
    private teacherService: TeacherService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.getTeacherIdSafely();

    if (this.teacherId) {
      this.loadTeacherData();
    } else {
      console.warn("No teacherId found in localStorage.");
      this.loading = false;
    }
  }

  // ✅ SSR-safe
  getTeacherIdSafely(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.teacherId = localStorage.getItem("teacherId");
    }
  }

  loadTeacherData(): void {
    this.loading = true;

    // Load basic teacher info
    this.teacherService.getById(this.teacherId!).subscribe({
      next: (res: ServiceResult<TeacherViewDto>) => {
        console.log("Teacher API RESPONSE:", res);

        if (res.success && res.data) {
          this.teacher = res.data;
          this.calculateStats();
        }
      },
      error: (err: any) => {
        console.error("Failed to load teacher data:", err);
        this.loading = false;
      },
      complete: () => {
        this.loadAdditionalData();
      }
    });
  }

  loadAdditionalData(): void {
    // Load teacher subjects
    this.teacherService.getTeacherSubjects(this.teacherId!).subscribe({
      next: (res: ServiceResult<SubjectViewDto[]>) => {
        if (res.success && res.data) {
          this.teacherSubjects = res.data;
          this.totalSubjects = this.teacherSubjects.length;
        }
      },
      error: (err: any) => {
        console.error("Failed to load teacher subjects:", err);
      }
    });

    // Load teacher classes
    this.teacherService.getTeacherClasses(this.teacherId!).subscribe({
      next: (res: ServiceResult<ClassViewDto[]>) => {
        if (res.success && res.data) {
          console.log(res);
          this.teacherClasses = res.data;
          this.totalClasses = this.teacherClasses.length;
        }
      },
      error: (err: any) => {
        console.error("Failed to load teacher classes:", err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    if (this.teacher) {
      this.totalSubjects = this.teacher.subjects?.length || 0;
      this.totalClasses = this.teacher.classNames?.length || 0;
      this.totalSpecializations = this.teacher.specializedCurriculumIds?.length || 0;
      
      // Note: You would need a separate API to get total students
      // For now, we'll calculate it if you have access to class data
      this.totalStudents = 0; // This would come from another API call
    }
  }

  formatList(items: string[]): string {
    if (!items || items.length === 0) return 'None';
    if (items.length <= 3) return items.join(', ');
    return `${items.slice(0, 3).join(', ')} +${items.length - 3} more`;
  }

  getAccountStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      case 'suspended': return 'danger';
      default: return 'info';
    }
  }

  getAccountStatusText(status: string): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}