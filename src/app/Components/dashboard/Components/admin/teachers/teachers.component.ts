import { Component } from '@angular/core';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Teacher } from '../../../../../Interfaces/teacher';

@Component({
  selector: 'app-teachers',
  imports: [FormsModule,NgFor,NgIf],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent {
  private subscription = new Subscription();
  teacherCount: number = 0;
  subjectName: string = '';
  teachersBySubject: Teacher[] = [];

  constructor(private adminManagement: AdminManagementService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.adminManagement.CountTeachers().subscribe({
        next: count => this.teacherCount = count,
        error: err => alert(`Error loading teacher count: ${err.message}`)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  LoadTeachersBySubjectName(): void {
    const subject = this.subjectName.trim();
    if (!subject) {
      alert('Please enter a subject name');
      return;
    }

    this.adminManagement.GetTeachersBySubjectName(subject).subscribe({
      next: teachers => {
        this.teachersBySubject = teachers;
        console.log(`Teachers for subject ${subject}:`, teachers);
      },
      error: err => {
        alert(`Error loading teachers for subject ${subject}: ${err.message}`);
      }
    });
  }
}
