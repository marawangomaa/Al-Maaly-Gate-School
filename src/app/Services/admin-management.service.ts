import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { AuthService } from './auth.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiResponse } from '../Interfaces/auth';
import { Teacher } from '../Interfaces/teacher';


@Injectable({
  providedIn: 'root'
})
export class AdminManagementService {

  private apiUrl: string = `${environment.apiBaseUrl}/AdminManagement`;
  private token: string | null;
  private headers: HttpHeaders;


  constructor(private http: HttpClient, private authService: AuthService) {
    this.token = this.authService.getToken();
    this.headers = new HttpHeaders(
      {
        'Authorization': `Bearer ${this.token}`
      })
  }
  //ApiResponseHandler
  private handleApiResponse<T>(request$: Observable<ApiResponse<T>>): Observable<T> {
    return request$.pipe(
      map(res => {
        if (!res) throw new Error('No response from server');
        if (!res.success) throw new Error(res.message || 'Operation failed');
        return res.data;
      }),
      catchError(err => {
        const backendMsg =
          err?.error?.message ||
          err?.message ||
          'Unexpected server error';
        return throwError(() => new Error(backendMsg));
      })
    );
  }
  //Count
  CountTeachers(): Observable<number> {
    return this.handleApiResponse<number>(
      this.http.get<ApiResponse<number>>(`${this.apiUrl}/TeacherCount`, { headers: this.headers })
    );
  }
  //Teacher By Subject Name
  GetTeachersBySubjectName(subjectName: string): Observable<Teacher[]> {
    const url = `${this.apiUrl}/TeacherBySubject?subjectName=${encodeURIComponent(subjectName)}`;
    return this.handleApiResponse<Teacher[]>(
      this.http.get<ApiResponse<Teacher[]>>(url, { headers: this.headers })
    );
  } 
}


