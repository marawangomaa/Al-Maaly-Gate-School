import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ClassExamsService } from '../../../../../Services/class-exams.service';
import { iclassExams } from '../../../../../Interfaces/iclassExams';
import { ApiResponse } from '../../../../../Interfaces/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../Services/auth.service';
import { StudentService } from '../../../../../Services/student.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-student-tests',
  imports: [CommonModule, DatePipe, TranslateModule],
  templateUrl: './student-tests.component.html',
  styleUrl: './student-tests.component.css'
})
export class StudentTestsComponent implements OnInit {
  StudentEntityId!: string;
  ClassId!: string;
  tests?: iclassExams[];
  _ClassExams = inject(ClassExamsService);
  _StudentProfile = inject(StudentService);
  _Auth = inject(AuthService);
  private translate = inject(TranslateService);

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

  private toLocalDate(dateStr: string): Date {
    const d = new Date(dateStr);
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );
  }
  private calculateStatus(start: Date, end: Date): 'Upcoming' | 'Running' | 'Finished' {
    const now = new Date();

    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Running';
    return 'Finished';
  }
  GetStudentEntity(StudentEntityId: string) {
    this._StudentProfile.GetStudentEntity(StudentEntityId).subscribe({
      next: (response: ApiResponse<any>) => {
        this.ClassId = response.data.classId;
        if (this.ClassId) {
          console.log('Student classId:', this.ClassId);
          this.GetClassExams(this.ClassId);
        } else {
          console.warn(this.translate.instant('STUDENT_TESTS_TS.WARNINGS.CLASS_ID_NOT_FOUND'));
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

        this.tests = response.data.map(exam => {
          const startLocal = this.toLocalDate(exam.start);
          const endLocal = this.toLocalDate(exam.end);

          return {
            ...exam,
            start: startLocal as any,
            end: endLocal as any,
            status: this.calculateStatus(startLocal, endLocal)
          };
        });

        console.log(this.tests);
      },
      error: (error: ApiResponse<iclassExams[]>) => {
        console.log(error.message);
      }
    });
  }

}