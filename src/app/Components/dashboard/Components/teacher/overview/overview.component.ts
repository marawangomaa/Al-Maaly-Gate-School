import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherService } from '../../../../../Services/teacher.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {
  teacher: any = null;
  loading = true;
  teacherId: string | null = null;

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

    this.teacherService.getById(this.teacherId!).subscribe({
      next: (res) => {
        console.log("API RESPONSE:", res);

        if (res.success && res.data) {
          this.teacher = this.normalizeTeacher(res.data);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error("Failed to load teacher data:", err);
        this.loading = false;
      }
    });
  }

  // ✅ Normalize the backend response for the HTML
  normalizeTeacher(dto: any) {
    return {
      id: dto.id,
      name: dto.fullName,
      email: dto.email,
      phone: dto.contactInfo,
      subject: dto.subjects?.[0] || "Unknown",
      classesCount: dto.classNames?.length || 0,
      testsCount: 0,
      questionsCount: 0,
      recentActivities: []
    };
  }

  numberOrZero(n: any): number {
    return Number(n) || 0;
  }
}
