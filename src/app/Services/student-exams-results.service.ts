import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { istudentExamResults } from '../Interfaces/istudentExamResults';
import { ApiResponse } from '../Interfaces/auth';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentExamsResultsService {
  private apiUrl = `${environment.apiUrl}/StudentExamResult/student/results`;
  _Auth = inject(AuthService);

  constructor(private http: HttpClient) { }

  GetStudentExamsResults(StudentId: string): Observable<ApiResponse<istudentExamResults[]>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<istudentExamResults[]>>(`${this.apiUrl}/${StudentId}`, { headers });
  }
}