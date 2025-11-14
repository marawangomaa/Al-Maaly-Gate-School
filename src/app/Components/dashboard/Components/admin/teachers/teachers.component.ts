import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Teacher } from '../../../../../Interfaces/teacher';
import { TeacherService } from '../../../../../Services/teacher.service';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { AuthService } from '../../../../../Services/AuthService';


@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  teacherCount = 0;
  subjectName = '';
  teachersBySubject: Teacher[] = [];
  allTeachers: Teacher[] = [];
  hasSearched = false;
  isLoading = false;

  constructor(
    private teacherService: TeacherService,
    private adminService: AdminManagementService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.LoadTeacherCount();
    this.LoadAllTeachers();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //Load teachers by subject name
  LoadTeachersBySubjectName(): void {
    const subject = this.subjectName.trim();
    this.hasSearched = true;

    if (!subject) {
      alert('Please enter a subject name');
      this.teachersBySubject = [];
      return;
    }

    this.isLoading = true;

    this.subscription.add(
      this.adminService.GetTeachersBySubjectName(subject).subscribe({
        next: teachers => {
          this.teachersBySubject = teachers;
          this.isLoading = false;
          console.log(`Teachers for subject ${subject}:`, teachers);
        },
        error: err => {
          this.isLoading = false;
          alert(`Error loading teachers for subject ${subject}: ${err.message}`);
        }
      })
    );
  }

  //Approve Teacher
  ApproveTeacherAction(teacherId: string): void {
    if (!confirm('Are you sure you want to approve this teacher?')) return;

    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('Admin user ID not found. Please log in again.');
      return;
    }

    this.subscription.add(
      this.adminService.ApproveTeacher(teacherId, adminUserId).subscribe({
        next: result => {
          if (result) {
            alert('Teacher approved successfully');
            // Update UI locally instead of reloading all data
            const teacher = this.allTeachers.find(t => t.id === teacherId);
            if (teacher) teacher.profileStatus = 'Approved';
          } else {
            alert('Failed to approve teacher');
          }
        },
        error: err => alert(`Error approving teacher: ${err.message}`)
      })
    );
  }
  //reject-teacher
  RejectTeacherAction(teacherId: string): void {
    if (!confirm('Are you sure you want to reject this teacher?')) return;
    const adminUserId = this.authService.userId;
    if (!adminUserId) {
      alert('Admin user ID not found. Please log in again.');
      return;
    }
    this.subscription.add(
      this.adminService.RejectTeacher(teacherId, adminUserId).subscribe({
        next: result => {
          if (result) {
            alert('Teacher rejected successfully');
            // Update UI locally instead of reloading all data
            const teacher = this.allTeachers.find(t => t.id === teacherId);
            if (teacher) teacher.profileStatus = 'Rejected';
          }
          else {
            alert('Failed to reject teacher');
          }
        },
        error: err => alert(`Error rejecting teacher: ${err.message}`)
      })
    );

  }

  //Load total teacher count
  private LoadTeacherCount(): void {
    this.subscription.add(
      this.adminService.CountTeachers().subscribe({
        next: count => (this.teacherCount = count),
        error: err => alert(`Error loading teacher count: ${err.message}`)
      })
    );
  }
  //Load all teachers
  private LoadAllTeachers(): void {
    this.subscription.add(
      this.teacherService.GetAllTeachers().subscribe({
        next: teachers => {
          this.allTeachers = teachers;
          console.log('All Teachers:', teachers);
        },
        error: err => alert(`Error loading all teachers: ${err.message}`)
      })
    );
  }
}
