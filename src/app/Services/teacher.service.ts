import { Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponseHandler } from '../utils/api-response-handler';
import { Teacher } from '../Interfaces/teacher';
import { ApiResponse } from '../Interfaces/auth';
import { BulkAssignTeachersDto, CreateTeacherDto, ServiceResult, TeacherAdminViewDto, TeacherDetailsDto, TeacherViewDto, UpdateTeacherDto } from '../Interfaces/iteacher';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl: string = `${environment.apiBaseUrl}/Teacher`;

  constructor(private http: HttpClient) { }
  //Get All Teachers
  GetAllTeachers(): Observable<Teacher[]> {
    return ApiResponseHandler.handleApiResponse<Teacher[]>(
      this.http.get<ApiResponse<Teacher[]>>(this.apiUrl)
    );
  }

  // Get all teachers
  getAll(): Observable<ServiceResult<TeacherViewDto[]>> {
    return this.http.get<ServiceResult<TeacherViewDto[]>>(this.apiUrl);
  }

  // Get teacher by ID
  getById(id: string): Observable<ServiceResult<TeacherViewDto>> {
    return this.http.get<ServiceResult<TeacherViewDto>>(`${this.apiUrl}/${id}`);
  }

  // NEW: Get teacher details with full information
  getDetails(id: string): Observable<ServiceResult<TeacherDetailsDto>> {
    return this.http.get<ServiceResult<TeacherDetailsDto>>(`${this.apiUrl}/${id}/details`);
  }

  // NEW: Get teachers by curriculum
  getByCurriculum(curriculumId: string): Observable<ServiceResult<TeacherViewDto[]>> {
    return this.http.get<ServiceResult<TeacherViewDto[]>>(`${this.apiUrl}/curriculum/${curriculumId}`);
  }

  // NEW: Get teacher count by curriculum
  getCountByCurriculum(curriculumId: string): Observable<ServiceResult<number>> {
    return this.http.get<ServiceResult<number>>(`${this.apiUrl}/curriculum/${curriculumId}/count`);
  }

  // NEW: Add teacher to curriculum
  addToCurriculum(teacherId: string, curriculumId: string): Observable<ServiceResult<TeacherViewDto>> {
    return this.http.post<ServiceResult<TeacherViewDto>>(
      `${this.apiUrl}/${teacherId}/curriculum/${curriculumId}`, 
      {}
    );
  }

  // NEW: Remove teacher from curriculum
  removeFromCurriculum(teacherId: string, curriculumId: string): Observable<ServiceResult<boolean>> {
    return this.http.delete<ServiceResult<boolean>>(
      `${this.apiUrl}/${teacherId}/curriculum/${curriculumId}`
    );
  }

  // Create new teacher
  create(dto: CreateTeacherDto): Observable<ServiceResult<TeacherViewDto>> {
    return this.http.post<ServiceResult<TeacherViewDto>>(this.apiUrl, dto);
  }

  // Update teacher
  update(id: string, dto: UpdateTeacherDto): Observable<ServiceResult<TeacherViewDto>> {
    return this.http.put<ServiceResult<TeacherViewDto>>(`${this.apiUrl}/${id}`, dto);
  }

  // Delete teacher
  delete(id: string): Observable<ServiceResult<boolean>> {
    return this.http.delete<ServiceResult<boolean>>(`${this.apiUrl}/${id}`);
  }

  // NEW: Bulk assign teachers to classes
  bulkAssignToClasses(dto: BulkAssignTeachersDto): Observable<ServiceResult<boolean>> {
    return this.http.post<ServiceResult<boolean>>(`${this.apiUrl}/bulk-assign`, dto);
  }

  // NEW: Get admin view of teachers
  getAdminView(): Observable<ServiceResult<TeacherAdminViewDto[]>> {
    return this.http.get<ServiceResult<TeacherAdminViewDto[]>>(`${this.apiUrl}/admin`);
  }

  // NEW: Check if teacher exists
  exists(id: string): Observable<ServiceResult<boolean>> {
    return this.http.get<ServiceResult<boolean>>(`${this.apiUrl}/exists/${id}`);
  }

  // NEW: Get teachers with specific specialization
  getBySpecialization(curriculumId: string): Observable<ServiceResult<TeacherViewDto[]>> {
    return this.http.get<ServiceResult<TeacherViewDto[]>>(
      `${this.apiUrl}/specialization/${curriculumId}`
    );
  }
  getTeachersNotAssignedToSubject(subjectId: string): Observable<ApiResponse<TeacherViewDto[]>> {
    return this.http.get<ApiResponse<TeacherViewDto[]>>(
      `${this.apiUrl}/not-assigned/subject/${subjectId}`
    );
  }
  getTeachersAssignedToSubject(subjectId: string): Observable<ApiResponse<TeacherViewDto[]>>
  {
    return this.http.get<ApiResponse<TeacherViewDto[]>>(
      `${this.apiUrl}/assigned/subject/${subjectId}`
    );
  }
}

