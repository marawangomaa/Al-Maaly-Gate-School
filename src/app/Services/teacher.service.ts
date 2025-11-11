import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateTeacherDto, ServiceResult, TeacherViewDto, UpdateTeacherDto } from '../Interfaces/iteacher';
import { Observable } from 'rxjs';
import { environment } from '../Environment/Environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private readonly apiUrl = `${environment.apiBaseUrl}/teacher`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ServiceResult<TeacherViewDto[]>> {
    return this.http.get<ServiceResult<TeacherViewDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ServiceResult<TeacherViewDto>> {
    return this.http.get<ServiceResult<TeacherViewDto>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTeacherDto): Observable<ServiceResult<TeacherViewDto>> {
    return this.http.post<ServiceResult<TeacherViewDto>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateTeacherDto): Observable<ServiceResult<TeacherViewDto>> {
    return this.http.put<ServiceResult<TeacherViewDto>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<ServiceResult<boolean>> {
    return this.http.delete<ServiceResult<boolean>>(`${this.apiUrl}/${id}`);
  }
}
