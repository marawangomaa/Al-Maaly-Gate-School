import { Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { ApiResponse } from '../Interfaces/auth';
import { HttpClient } from '@angular/common/http';
import { istudentProfile } from '../Interfaces/istudentProfile';

@Injectable({
  providedIn: 'root'
})
export class StudentProfileService {

  private apiUrl = `${environment.apiUrl}/Student`;

  constructor(private http: HttpClient) { }

  GetStudentProfile(studentId: string): Observable<ApiResponse<istudentProfile>> {
    return this.http.get<ApiResponse<istudentProfile>>(`${this.apiUrl}/${studentId}`);
  }

}
