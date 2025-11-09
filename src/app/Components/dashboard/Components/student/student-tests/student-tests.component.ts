import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ClassExamsService } from '../../../../../Services/class-exams.service';
import { iclassExams } from '../../../../../Interfaces/iclassExams';
import { ApiResponse } from '../../../../../Interfaces/auth';

@Component({
  selector: 'app-student-tests',
  imports: [CommonModule, DatePipe],
  templateUrl: './student-tests.component.html',
  styleUrl: './student-tests.component.css'
})
export class StudentTestsComponent implements OnInit {

  tests?: iclassExams[];
  _ClassExams = inject(ClassExamsService);

  ngOnInit() {
    this.GetClassExams();
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

  startExam(exam: any) {
    if (exam.canStart && exam.status !== 'finished') {
      alert(`بدأ اختبار ${exam.subject} الآن!`);
      exam.status = 'ongoing';
    }
  }

  GetClassExams() {
    this._ClassExams.GetClassExamsForStudent("ecc98cc7-debe-486e-863a-7c2b032ffc2e").subscribe({
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