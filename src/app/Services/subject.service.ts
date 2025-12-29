import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, SubjectCreateDto, SubjectUpdateDto, SubjectViewDto } from '../Interfaces/isubject';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private readonly apiUrl = `${environment.apiUrl}/subject`;
  constructor(private http: HttpClient) { }

  // Subject CRUD Operations
  getAll(): Observable<ApiResponse<SubjectViewDto[]>> {
    return this.http.get<ApiResponse<SubjectViewDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<SubjectViewDto>> {
    return this.http.get<ApiResponse<SubjectViewDto>>(`${this.apiUrl}/${id}`);
  }

  create(subject: SubjectCreateDto): Observable<ApiResponse<SubjectViewDto>> {
    return this.http.post<ApiResponse<SubjectViewDto>>(this.apiUrl, subject);
  }

  update(id: string, subject: SubjectUpdateDto): Observable<ApiResponse<SubjectViewDto>> {
    return this.http.put<ApiResponse<SubjectViewDto>>(`${this.apiUrl}/${id}`, subject);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  // Get subjects by grade
  getSubjectsByGrade(gradeId: string): Observable<ApiResponse<SubjectViewDto[]>> {
    return this.http.get<ApiResponse<SubjectViewDto[]>>(`${this.apiUrl}/grade/${gradeId}`);
  }

  // Get subject count
  getCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/count`);
  }
}