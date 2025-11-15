import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, SubjectCreateDto, SubjectUpdateDto, SubjectViewDto } from '../Interfaces/isubject';
import { HttpClient } from '@angular/common/http';
import { environment } from '../Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private readonly apiUrl = `${environment.apiBaseUrl}/subject`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SubjectViewDto[]>> {
    return this.http.get<ApiResponse<SubjectViewDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<SubjectViewDto>> {
    return this.http.get<ApiResponse<SubjectViewDto>>(`${this.apiUrl}/${id}`);
  }

  create(dto: SubjectCreateDto): Observable<ApiResponse<SubjectViewDto>> {
    return this.http.post<ApiResponse<SubjectViewDto>>(this.apiUrl, dto);
  }

  update(id: string, dto: SubjectUpdateDto): Observable<ApiResponse<SubjectViewDto>> {
    return this.http.put<ApiResponse<SubjectViewDto>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
