import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../Interfaces/auth';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { istudentExamSubmission } from '../Interfaces/istudentExamSubmission';
import { istudentExamAnswer } from '../Interfaces/istudentExamAnswer';
import { StudentAnswerWithQuestionDto } from '../Interfaces/StudentAnswerWithQuestionDto';


@Injectable({
  providedIn: 'root'
})
export class StudentExamAnswerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/StudentExamAnswer`;

  submitExam(submission: istudentExamSubmission): Observable<ApiResponse<istudentExamAnswer>> {
    return this.http.post<ApiResponse<istudentExamAnswer>>(
      `${this.apiUrl}/SubmitExam`,
      submission
    );
  }

  StudentResultWithQuestions(studentId: string, examId: string): Observable<ApiResponse<StudentAnswerWithQuestionDto[]>> {
    return this.http.get<ApiResponse<StudentAnswerWithQuestionDto[]>>(`${this.apiUrl}/studentAnswerWithCorrection/${studentId}/${examId}`);
  }

}
