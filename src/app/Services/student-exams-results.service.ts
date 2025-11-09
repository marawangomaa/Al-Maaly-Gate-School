import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { istudentExamResults } from '../Interfaces/istudentExamResults';
import { ApiResponse } from '../Interfaces/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentExamsResultsService {
  private apiUrl = `${environment.apiUrl}/StudentExamResult/student/results`;

  constructor(private http: HttpClient) { }

  GetStudentExamsResults(StudentId: string): Observable<ApiResponse<istudentExamResults[]>> {
    return this.http.get<ApiResponse<istudentExamResults[]>>(`${this.apiUrl}/${StudentId}`);
  }
}