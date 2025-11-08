import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-teacher-accounts',
  imports: [CommonModule],
  templateUrl: './admin-teacher-accounts.component.html',
  styleUrl: './admin-teacher-accounts.component.css'
})
export class AdminTeacherAccountsComponent {
  selectedStatus = 'all';

  teachers = [
    {
      id: 1,
      name: 'أ. أحمد علي',
      subject: 'الرياضيات',
      email: 'ahmed.math@example.com',
      experience: 7,
      status: 'pending'
    },
    {
      id: 2,
      name: 'أ. منى عبد الله',
      subject: 'اللغة الإنجليزية',
      email: 'mona.english@example.com',
      experience: 5,
      status: 'accepted'
    },
    {
      id: 3,
      name: 'أ. محمد إبراهيم',
      subject: 'العلوم',
      email: 'mohamed.science@example.com',
      experience: 10,
      status: 'rejected'
    },
    {
      id: 4,
      name: 'أ. نجلاء حسن',
      subject: 'الكيمياء',
      email: 'naglaa.chemistry@example.com',
      experience: 8,
      status: 'suspended'
    }
  ];

  filteredTeachers() {
    if (this.selectedStatus === 'all') return this.teachers;
    return this.teachers.filter(t => t.status === this.selectedStatus);
  }

  acceptTeacher(teacher: any) {
    teacher.status = 'accepted';
  }

  rejectTeacher(teacher: any) {
    teacher.status = 'rejected';
  }

  suspendTeacher(teacher: any) {
    teacher.status = 'suspended';
  }
}
