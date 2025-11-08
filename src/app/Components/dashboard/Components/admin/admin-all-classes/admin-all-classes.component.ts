import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-all-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-all-classes.component.html',
  styleUrl: './admin-all-classes.component.css'
})
export class AdminAllClassesComponent {
  classes: any = {
    "pageTitle": "إدارة المحاضرات",
    "filters": {
      "statusOptions": ["الكل", "متاحة للحضور", "انتهت", "لم تبدأ بعد"],
      "selectedStatus": "الكل"
    },
    "lectures": [
      {
        "lectureId": 1,
        "subject": "الرياضيات",
        "teacher": "أ. أحمد علي",
        "date": "2025-10-06",
        "startTime": "09:00",
        "endTime": "10:30",
        "status": "متاحة للحضور",
        "studentsPresent": 22,
        "maxStudents": 30,
        "attendanceAvailable": true
      },
      {
        "lectureId": 2,
        "subject": "اللغة الإنجليزية",
        "teacher": "أ. منى عبد الله",
        "date": "2025-10-06",
        "startTime": "11:00",
        "endTime": "12:30",
        "status": "انتهت",
        "studentsPresent": 28,
        "maxStudents": 30,
        "attendanceAvailable": false
      },
      {
        "lectureId": 3,
        "subject": "العلوم",
        "teacher": "أ. محمد إبراهيم",
        "date": "2025-10-07",
        "startTime": "08:30",
        "endTime": "10:00",
        "status": "لم تبدأ بعد",
        "studentsPresent": 0,
        "maxStudents": 25,
        "attendanceAvailable": false
      }
    ],
    "actions": {
      "markAttendance": "تسجيل حضور",
      "viewDetails": "عرض التفاصيل"
    }
  };

  lectures = this.classes.lectures;
  filters = this.classes.filters;
  selectedStatus = this.filters.selectedStatus;

  filteredLectures() {
    if (this.selectedStatus === 'الكل') return this.lectures;
    return this.lectures.filter((l: { status: any; }) => l.status === this.selectedStatus);
  }

  markAttendance(lecture: any) {
    alert(`✅ تم تسجيل حضور المحاضرة: ${lecture.subject}`);
  }

  viewDetails(lecture: any) {
    alert(`📘 عرض تفاصيل المحاضرة: ${lecture.subject} مع ${lecture.teacher}`);
  }
}
