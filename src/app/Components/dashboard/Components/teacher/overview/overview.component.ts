import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type TeacherModel = {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  profileImage?: string | null;
  classesCount?: number;
  testsCount?: number;
  questionsCount?: number;
  recentActivities?: Array<{ date: string; text: string }>;
};

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {
  teacher?: TeacherModel; // now it's possibly undefined
  loading = true;

  constructor() {}

  ngOnInit(): void {
    this.loadTeacherData();
  }

  loadTeacherData(): void {
    // TODO: replace with real API call
    setTimeout(() => {
      this.teacher = {
        id: 't-1001',
        name: 'Mohamed Ali',
        phone: '+20 100 123 4567',
        email: 'm.ali@school.edu',
        subject: 'Mathematics',
        profileImage: '../../../../../../assets/images/photo.JPG', // or a url if exists
        classesCount: 4,
        testsCount: 12,
        questionsCount: 108,
        recentActivities: [
          { date: '2025-09-28', text: 'Created Test: Algebra Midterm' },
          { date: '2025-09-22', text: 'Added 15 questions to Geometry set' },
          { date: '2025-09-18', text: 'Started Live Class: Trigonometry' },
        ],
      };
      this.loading = false;
    }, 500);
  }

  numberOrZero(n?: number): number {
    return typeof n === 'number' ? n : 0;
  }
}
