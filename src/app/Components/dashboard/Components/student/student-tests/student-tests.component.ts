import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-student-tests',
  imports: [CommonModule, DatePipe],
  templateUrl: './student-tests.component.html',
  styleUrl: './student-tests.component.css'
})
export class StudentTestsComponent {
  tests: any[] = [
    {
      "id": "exam-001",
      "subject": "الرياضيات",
      "teacher": "أ. خالد عبد الله",
      "startTime": "2025-10-06T09:00:00",
      "endTime": "2025-10-06T10:00:00",
      "status": "finished",
      "score": 85,
      "canStart": false,
      "link": "https://school-platform.com/exams/exam-001"
    },
    {
      "id": "exam-002",
      "subject": "اللغة العربية",
      "teacher": "أ. منى محمود",
      "startTime": "2025-10-06T12:00:00",
      "endTime": "2025-10-06T13:00:00",
      "status": "ongoing",
      "score": null,
      "canStart": true,
      "link": "https://school-platform.com/exams/exam-002"
    },
    {
      "id": "exam-003",
      "subject": "العلوم",
      "teacher": "أ. سامي نجيب",
      "startTime": "2025-10-07T09:00:00",
      "endTime": "2025-10-07T10:30:00",
      "status": "available",
      "score": null,
      "canStart": true,
      "link": "https://school-platform.com/exams/exam-003"
    },
    {
      "id": "exam-004",
      "subject": "اللغة الإنجليزية",
      "teacher": "أ. مها عبد السلام",
      "startTime": "2025-10-05T10:00:00",
      "endTime": "2025-10-05T11:00:00",
      "status": "finished",
      "score": 92,
      "canStart": false,
      "link": "https://school-platform.com/exams/exam-004"
    }
  ]
  exams = this.tests;
  filter: 'all' | 'available' | 'ongoing' | 'finished' = 'all';
  get filteredExams() {
    switch (this.filter) {
      case 'available':
        return this.exams.filter(e => e.status === 'available');
      case 'ongoing':
        return this.exams.filter(e => e.status === 'ongoing');
      case 'finished':
        return this.exams.filter(e => e.status === 'finished');
      default:
        return this.exams;
    }
  }
  startExam(exam: any) {
    if (exam.canStart && exam.status !== 'finished') {
      alert(`بدأ اختبار ${exam.subject} الآن!`);
      exam.status = 'ongoing';
    }
  }
}
