import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { StudentProfileService } from '../../../../Services/student-profile.service';
import { ApiResponse } from '../../../../Interfaces/auth';
import { istudentProfile } from '../../../../Interfaces/istudentProfile';

@Component({
  selector: 'app-studen-profile',
  imports: [DatePipe, CommonModule],
  templateUrl: './studen-profile.component.html',
  styleUrl: './studen-profile.component.css'
})
export class StudenProfileComponent implements OnInit {

  studentProfile?: istudentProfile;
  _StudentProfile = inject(StudentProfileService);

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

  ngOnInit() {
    this.GetProfileInformation();
  }

  GetProfileInformation() {
    this._StudentProfile.GetStudentProfile("4f98823e-254c-474e-ae5c-6c799ac05551").subscribe({
      next: (response: ApiResponse<istudentProfile>) => {
        this.studentProfile = response.data;
        console.log(response.data, response.success);
      },
      error: (error: ApiResponse<istudentProfile>) => {
        console.log(error.message);
      }
    });
  }

}
