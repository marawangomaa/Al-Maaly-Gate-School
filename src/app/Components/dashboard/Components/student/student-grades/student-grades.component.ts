import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-student-grades',
  imports: [CommonModule, DatePipe],
  templateUrl: './student-grades.component.html',
  styleUrl: './student-grades.component.css'
})
export class StudentGradesComponent {
  Stgrades: any[] = [
    {
      "id": "gr-001",
      "subject": "الرياضيات",
      "teacher": "أ. خالد عبد الله",
      "type": "assignment",
      "title": "حل واجب الوحدة الأولى",
      "date": "2025-09-15",
      "score": 18,
      "total": 20,
      "grade": "ممتاز",
      "status": "graded",
      "method": "online"
    },
    {
      "id": "gr-002",
      "subject": "اللغة العربية",
      "teacher": "أ. منى محمود",
      "type": "online_test",
      "title": "اختبار القواعد الأسبوعي",
      "date": "2025-09-20",
      "score": 42,
      "total": 50,
      "grade": "جيد جدًا",
      "status": "graded",
      "method": "online"
    },
    {
      "id": "gr-003",
      "subject": "العلوم",
      "teacher": "أ. سامي نجيب",
      "type": "offline_exam",
      "title": "اختبار العملي - الفصل الأول",
      "date": "2025-09-25",
      "score": 45,
      "total": 50,
      "grade": "ممتاز",
      "status": "graded",
      "method": "offline"
    },
    {
      "id": "gr-004",
      "subject": "اللغة الإنجليزية",
      "teacher": "أ. مها عبد السلام",
      "type": "final",
      "title": "الاختبار النهائي - الترم الأول",
      "date": "2025-10-01",
      "score": 82,
      "total": 100,
      "grade": "جيد جدًا",
      "status": "graded",
      "method": "offline"
    },
    {
      "id": "gr-005",
      "subject": "التاريخ",
      "teacher": "أ. أحمد السعدي",
      "type": "online_test",
      "title": "اختبار قصير - الوحدة الثانية",
      "date": "2025-10-05",
      "score": null,
      "total": 30,
      "grade": "",
      "status": "pending",
      "method": "online"
    }
  ]
  grades = this.Stgrades;
  filter: 'all' | 'assignments' | 'finals' | 'online' | 'offline' = 'all';
  get filteredGrades() {
    switch (this.filter) {
      case 'assignments':
        return this.grades.filter(g => g.type === 'assignment');
      case 'finals':
        return this.grades.filter(g => g.type === 'final');
      case 'online':
        return this.grades.filter(g => g.method === 'online');
      case 'offline':
        return this.grades.filter(g => g.method === 'offline');
      default:
        return this.grades;
    }
  }
  calcPercentage(grade: any): number {
    return Math.round((grade.score / grade.total) * 100);
  }
}
