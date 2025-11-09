import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../Interfaces/auth';
import { Observable } from 'rxjs';
import { iclassExams } from '../Interfaces/iclassExams';

@Injectable({
  providedIn: 'root'
})
export class ClassExamsService {

  private apiUrl = `${environment.apiUrl}/StudentExamAnswer/studentExams`;

  constructor(private http: HttpClient) { }

  GetClassExamsForStudent(ClassId: string): Observable<ApiResponse<iclassExams[]>> {
    return this.http.get<ApiResponse<iclassExams[]>>(`${this.apiUrl}/${ClassId}`);
  }
}
