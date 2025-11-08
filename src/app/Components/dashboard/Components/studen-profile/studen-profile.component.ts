import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-studen-profile',
  imports: [DatePipe, CommonModule],
  templateUrl: './studen-profile.component.html',
  styleUrl: './studen-profile.component.css'
})
export class StudenProfileComponent {

  student: any = {
    "id": "stu-2025-00123",
    "firstName": "أحمد",
    "lastName": "الشاوي",
    "dateOfBirth": "2010-03-21",
    "academicYear": "2025/2026",
    "semester": "الفصل الأول",
    "guardians": [
      {
        "name": "منى الشاوي",
        "relation": "الأم",
        "phone": "+201012345678",
        "email": "mona.shawki@example.com"
      },
      {
        "name": "علي الشاوي",
        "relation": "الأب",
        "phone": "+201098765432",
        "email": "ali.shawki@example.com"
      }
    ],
    "email": "ahmed.shawki@student.school.edu",
    "enrollmentYear": 2020,
    "photo": "https://placehold.jp/150x150.png",
    "notes": "طالب مجدّ في الأنشطة الرياضية. يحتاج متابعة في الرياضيات."
  }

}
