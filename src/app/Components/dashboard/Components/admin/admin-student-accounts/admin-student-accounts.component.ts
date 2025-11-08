import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-student-accounts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-student-accounts.component.html',
  styleUrl: './admin-student-accounts.component.css'
})
export class AdminStudentAccountsComponent {
  selectedStatus = 'all';

  students = [
    {
      id: 1,
      name: 'أحمد محمود',
      department: 'علوم الحاسب',
      email: 'ahmed@example.com',
      status: 'pending'
    },
    {
      id: 2,
      name: 'سارة علي',
      department: 'هندسة البرمجيات',
      email: 'sara@example.com',
      status: 'accepted'
    },
    {
      id: 3,
      name: 'محمد إبراهيم',
      department: 'نظم المعلومات',
      email: 'mohamed@example.com',
      status: 'rejected'
    },
    {
      id: 4,
      name: 'نور حسن',
      department: 'الذكاء الاصطناعي',
      email: 'noor@example.com',
      status: 'suspended'
    }
  ];

  filteredStudents() {
    if (this.selectedStatus === 'all') return this.students;
    return this.students.filter(s => s.status === this.selectedStatus);
  }

  acceptStudent(student: any) {
    student.status = 'accepted';
  }

  rejectStudent(student: any) {
    student.status = 'rejected';
  }

  suspendStudent(student: any) {
    student.status = 'suspended';
  }
}
