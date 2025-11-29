import { Injectable } from '@angular/core';
import { ApiResponse } from '../Interfaces/auth';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../Environment/Environment';
import { SubjectCreateDto, SubjectViewDto } from '../Interfaces/isubject';
import { BulkMoveClassesDto, ClassDto, ClassViewDto } from '../Interfaces/iclass';
import { CreateClassInGradeDto, CreateGradeDto, GradeViewDto, GradeWithDetailsDto, UpdateGradeDto } from '../Interfaces/igrade';

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  private apiUrl = `${environment.apiBaseUrl}/grade`;

  constructor(private http: HttpClient) { }

  // Grade CRUD Operations
  getAll(): Observable<ApiResponse<GradeViewDto[]>> {
    return this.http.get<ApiResponse<GradeViewDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<GradeViewDto>> {
    return this.http.get<ApiResponse<GradeViewDto>>(`${this.apiUrl}/${id}`);
  }

  getByName(gradeName: string): Observable<ApiResponse<GradeViewDto>> {
    return this.http.get<ApiResponse<GradeViewDto>>(`${this.apiUrl}/name/${gradeName}`);
  }

  getWithDetails(id: string): Observable<ApiResponse<GradeWithDetailsDto>> {
    return this.http.get<ApiResponse<GradeWithDetailsDto>>(`${this.apiUrl}/${id}/with-details`);
  }

  create(grade: CreateGradeDto): Observable<ApiResponse<GradeViewDto>> {
    return this.http.post<ApiResponse<GradeViewDto>>(this.apiUrl, grade);
  }

  update(id: string, grade: UpdateGradeDto): Observable<ApiResponse<GradeViewDto>> {
    return this.http.put<ApiResponse<GradeViewDto>>(`${this.apiUrl}/${id}`, grade);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  // Class Management
  createClass(gradeId: string, classData: CreateClassInGradeDto): Observable<ApiResponse<ClassViewDto>> {
    return this.http.post<ApiResponse<ClassViewDto>>(`${this.apiUrl}/${gradeId}/classes`, classData);
  }

  assignClassToGrade(gradeId: string, classData: ClassDto): Observable<ApiResponse<ClassViewDto>> {
    return this.http.put<ApiResponse<ClassViewDto>>(`${this.apiUrl}/${gradeId}/classes/assign`, classData);
  }

  getClassesByGrade(gradeId: string): Observable<ApiResponse<ClassViewDto[]>> {
    return this.http.get<ApiResponse<ClassViewDto[]>>(`${this.apiUrl}/${gradeId}/classes`);
  }

  // Subject Management
  addSubject(gradeId: string, subject: SubjectCreateDto): Observable<ApiResponse<SubjectViewDto>> {
    return this.http.post<ApiResponse<SubjectViewDto>>(`${this.apiUrl}/${gradeId}/subjects`, subject);
  }

  getSubjectsByGrade(gradeId: string): Observable<ApiResponse<SubjectViewDto[]>> {
    return this.http.get<ApiResponse<SubjectViewDto[]>>(`${this.apiUrl}/${gradeId}/subjects`);
  }

  // Move Operations
  moveClass(classId: string, newGradeId: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/classes/${classId}/move/${newGradeId}`, {});
  }

  moveSubject(subjectId: string, newGradeId: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/subjects/${subjectId}/move/${newGradeId}`, {});
  }

  // Remove Operations
  removeClass(classId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/classes/${classId}`);
  }

  removeSubject(subjectId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/subjects/${subjectId}`);
  }

  bulkMoveClasses(dto: BulkMoveClassesDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bulk-move-classes`, dto);
  }
}
