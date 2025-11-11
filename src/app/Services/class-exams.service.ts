import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../Interfaces/auth';
import { Observable } from 'rxjs';
import { iclassExams } from '../Interfaces/iclassExams';
import { AuthService } from './auth.service';
import { iexamWithQuestions } from '../Interfaces/iexamWithQuestions';

@Injectable({
  providedIn: 'root'
})
export class ClassExamsService {

  private apiUrl = `${environment.apiUrl}`;

  _Auth = inject(AuthService);
  constructor(private http: HttpClient) { }

  GetClassExamsForStudent(ClassId: string): Observable<ApiResponse<iclassExams[]>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<iclassExams[]>>(`${this.apiUrl}/StudentExamAnswer/studentExams/${ClassId}`, { headers });
  }

  GetExamById(ExamId: string): Observable<ApiResponse<iexamWithQuestions>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<iexamWithQuestions>>(`${this.apiUrl}/StudentExamAnswer/ExamQuestions/${ExamId}`, { headers });
  }

}
