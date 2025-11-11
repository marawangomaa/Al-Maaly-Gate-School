import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ClassExamsService } from '../../../../../Services/class-exams.service';
import { iclassExams } from '../../../../../Interfaces/iclassExams';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { Router } from '@angular/router';
import { StudentProfileService } from '../../../../../Services/student-profile.service';
import { AuthService } from '../../../../../Services/auth.service';

@Component({
  selector: 'app-student-tests',
  imports: [CommonModule, DatePipe],
  templateUrl: './student-tests.component.html',
  styleUrl: './student-tests.component.css'
})
export class StudentTestsComponent implements OnInit {
  StudentEntityId!: string;
  ClassId!: string;
  tests?: iclassExams[];
  _ClassExams = inject(ClassExamsService);
  _StudentProfile = inject(StudentProfileService);
  _Auth = inject(AuthService);

  ngOnInit() {
    this.StudentEntityId = this._Auth.getStudentId()!;
      this.GetStudentEntity(this.StudentEntityId);
  }
  constructor(private router: Router) { }

  startExam(examId: string) {
    const url = this.router.createUrlTree(['/app/exam', examId]);
    const absoluteUrl = window.location.origin + this.router.serializeUrl(url);
    window.open(absoluteUrl, '_blank');
  }

  filter: 'all' | 'Upcoming' | 'Running' | 'Finished' = 'all';

  get filteredExams() {
    switch (this.filter) {
      case 'Upcoming':
        return this.tests?.filter(e => e.status === 'Upcoming');
      case 'Running':
        return this.tests?.filter(e => e.status === 'Running');
      case 'Finished':
        return this.tests?.filter(e => e.status === 'Finished');
      default:
        return this.tests;
    }
  }

  GetStudentEntity(StudentEntityId: string) {
    this._StudentProfile.GetStudentEntity(StudentEntityId).subscribe({
      next: (response: ApiResponse<any>) => {
        this.ClassId = response.data.classId;
        if (this.ClassId) {
          // console.log('Student classId:', this.ClassId);
          this.GetClassExams(this.ClassId);
        } else {
          console.warn('Student classId not found');
        }
      },
      error: (error: ApiResponse<any>) => {
        console.log(error.message);
      }
    });
  }

  GetClassExams(ClassId: string) {
    this._ClassExams.GetClassExamsForStudent(ClassId).subscribe({
      next: (response: ApiResponse<iclassExams[]>) => {
        this.tests = response.data;
        console.log(response.data, response.success);
      },
      error: (error: ApiResponse<iclassExams[]>) => {
        console.log(error.message);
      }
    });
  }

}