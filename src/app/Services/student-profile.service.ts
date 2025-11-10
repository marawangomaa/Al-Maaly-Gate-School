import { inject, Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { ApiResponse } from '../Interfaces/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class StudentProfileService {

  private apiUrl = `${environment.apiUrl}/AfterAuthentication/profile`;
  private StudentEntity = `${environment.apiUrl}/Student`;
  _Auth = inject(AuthService);

  constructor(private http: HttpClient) { }

  GetStudentProfile(): Observable<ApiResponse<any>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<any>>(this.apiUrl, { headers });
  }

  GetStudentEntity(studentId: string): Observable<ApiResponse<any>> {

    const token = this._Auth?.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<any>>(`${this.StudentEntity}/${studentId}`, { headers });
  }

}
