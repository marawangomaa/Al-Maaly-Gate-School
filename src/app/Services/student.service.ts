import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { istudentExamSubmission } from '../Interfaces/istudentExamSubmission';
import { Observable } from 'rxjs';
import { ApiResponse } from '../Interfaces/auth';
import { istudentExamAnswer } from '../Interfaces/istudentExamAnswer';
import { StudentAnswerWithQuestionDto } from '../Interfaces/StudentAnswerWithQuestionDto';
import { AuthService } from './auth.service';
import { istudentExamResults } from '../Interfaces/istudentExamResults';
import { istudentProfile } from '../Interfaces/istudentProfile';
import { istudentSearchResult } from '../Interfaces/istudentSearchResult';
import istudentUpdate from '../Interfaces/istudentUpdate';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;
  _Auth = inject(AuthService);

  GetStudentProfile(): Observable<ApiResponse<any>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/AfterAuthentication/profile`, { headers });
  }

  // /api/Student/{id}/additional-info
  UpdateStudentAdditionalInfo(studentId: string, data: istudentUpdate): Observable<ApiResponse<istudentProfile>> {
    return this.http.put<ApiResponse<istudentProfile>>(`${this.apiUrl}/Student/${studentId}/additional-info`, data);
  }

  submitExam(submission: istudentExamSubmission): Observable<ApiResponse<istudentExamAnswer>> {
    return this.http.post<ApiResponse<istudentExamAnswer>>(
      `${this.apiUrl}/StudentExamAnswer/SubmitExam`,
      submission
    );
  }

  StudentResultWithQuestions(studentId: string, examId: string): Observable<ApiResponse<StudentAnswerWithQuestionDto[]>> {
    return this.http.get<ApiResponse<StudentAnswerWithQuestionDto[]>>(`${this.apiUrl}/StudentExamAnswer/studentAnswerWithCorrection/${studentId}/${examId}`);
  }

  GetStudentEntity(studentId: string): Observable<ApiResponse<any>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/Student/${studentId}`, { headers });
  }

  GetStudentExamsResults(StudentId: string): Observable<ApiResponse<istudentExamResults[]>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<istudentExamResults[]>>(`${this.apiUrl}/StudentExamResult/student/results/${StudentId}`, { headers });
  }

  GetAllStudents(): Observable<ApiResponse<istudentProfile[]>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<istudentProfile[]>>(`${this.apiUrl}/Student`, { headers });
  }

  searchStudents(term: string, parentId: string): Observable<ApiResponse<istudentSearchResult[]>> {
    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<istudentSearchResult[]>>(
      `${this.apiUrl}/Student/searchTerm?searchTerm=${encodeURIComponent(term)}&parentId=${encodeURIComponent(parentId)}`,
      { headers }
    );
  }

}
