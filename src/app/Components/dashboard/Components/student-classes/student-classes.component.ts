import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-student-classes',
  imports: [CommonModule, DatePipe],
  templateUrl: './student-classes.component.html',
  styleUrl: './student-classes.component.css'
})
export class StudentClassesComponent {

  classes: any[] = [
    {
      "id": "lec-001",
      "subject": "الرياضيات",
      "teacher": "أ. خالد عبد الله",
      "dateTime": "2025-10-06T10:00:00",
      "attended": true,
      "isOngoing": false,
      "canAttend": false,
      "link": "https://school-platform.com/lectures/lec-001"
    },
    {
      "id": "lec-002",
      "subject": "اللغة العربية",
      "teacher": "أ. منى محمود",
      "dateTime": "2025-10-06T13:00:00",
      "attended": false,
      "isOngoing": true,
      "canAttend": true,
      "link": "https://school-platform.com/lectures/lec-002"
    },
    {
      "id": "lec-003",
      "subject": "العلوم",
      "teacher": "أ. سامي نجيب",
      "dateTime": "2025-10-07T09:00:00",
      "attended": false,
      "isOngoing": false,
      "canAttend": true,
      "link": "https://school-platform.com/lectures/lec-003"
    },
    {
      "id": "lec-004",
      "subject": "اللغة الإنجليزية",
      "teacher": "أ. مها عبد السلام",
      "dateTime": "2025-10-08T11:30:00",
      "attended": false,
      "isOngoing": false,
      "canAttend": false,
      "link": "https://school-platform.com/lectures/lec-004"
    }
  ]
  lectures = this.classes;
  filter: 'all' | 'ongoing' | 'attended' | 'available' = 'all';
  get filteredLectures() {
    switch (this.filter) {
      case 'ongoing':
        return this.lectures.filter(l => l.isOngoing);
      case 'attended':
        return this.lectures.filter(l => l.attended);
      case 'available':
        return this.lectures.filter(l => l.canAttend && !l.attended);
      default:
        return this.lectures;
    }
  }
  attendLecture(lecture: any) {
    if (lecture.canAttend) {
      lecture.attended = true;
      alert(`تم تسجيل حضورك في محاضرة ${lecture.subject}`);
    }
  }
}
