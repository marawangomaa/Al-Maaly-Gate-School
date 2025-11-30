import { Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponseHandler } from '../utils/api-response-handler';
import { Teacher } from '../Interfaces/teacher';
import { ApiResponse } from '../Interfaces/auth';
import { CreateTeacherDto, ServiceResult, TeacherViewDto, UpdateTeacherDto } from '../Interfaces/iteacher';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl: string = `${environment.apiBaseUrl}/Teacher`;

  constructor(private http: HttpClient) {}
  //Get All Teachers
  GetAllTeachers():Observable<Teacher[]>
  {
    return ApiResponseHandler.handleApiResponse<Teacher[]>(
      this.http.get<ApiResponse<Teacher[]>>(this.apiUrl)
    );
  }

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

