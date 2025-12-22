import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ClassDto, ClassViewDto, CreateClassDto, UpdateClassDto } from '../Interfaces/iclass';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../Environment/Environment';
import { StudentModel } from '../Interfaces/istudent';
import { SubjectViewDto } from '../Interfaces/isubject';
import { ApiResponse } from '../Interfaces/auth';
import { AuthService } from './auth.service';

export interface ClassModel {
  id: string;
  grade: string;
  section: string;
  subject: string;
  meetingLink: string;
  startTime: string; // ISO string
  duration: number; // minutes
  ended: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = `${environment.apiBaseUrl}/class`;
  private token: string | null;
  private headers: HttpHeaders;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.token = this.authService.getToken();
    this.headers = new HttpHeaders(
      {
        'Authorization': `Bearer ${this.token}`
      })
   }

  // Class CRUD Operations
  getAll(): Observable<ApiResponse<ClassViewDto[]>> {
    return this.http.get<ApiResponse<ClassViewDto[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<ClassViewDto>> {
    return this.http.get<ApiResponse<ClassViewDto>>(`${this.apiUrl}/${id}`);
  }

  create(classData: CreateClassDto): Observable<ApiResponse<ClassDto>> {
    return this.http.post<ApiResponse<ClassDto>>(this.apiUrl, classData);
  }

  update(id: string, classData: UpdateClassDto): Observable<ApiResponse<ClassDto>> {
    return this.http.put<ApiResponse<ClassDto>>(`${this.apiUrl}/${id}`, classData);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  // Additional Class Operations
  getAllWithTeachers(): Observable<ApiResponse<ClassViewDto[]>> {
    return this.http.get<ApiResponse<ClassViewDto[]>>(`${this.apiUrl}/with-teachers`);
  }

  getStudentsByClass(classId: string): Observable<ApiResponse<StudentModel[]>> {
    return this.http.get<ApiResponse<StudentModel[]>>(`${this.apiUrl}/${classId}/students`);
  }

  getSubjectsByClass(classId: string): Observable<ApiResponse<SubjectViewDto[]>> {
    return this.http.get<ApiResponse<SubjectViewDto[]>>(`${this.apiUrl}/${classId}/subjects`);
  }

  getClassStatistics(classId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${classId}/statistics`, { headers: this.headers });
}

  exportClassData(classId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${classId}/export`, {
      responseType: 'blob'
    });
  }

  exportAllClasses(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-all`, {
      responseType: 'blob'
    });
  }

    getCount(): Observable<ApiResponse<number>> {
      return this.http.get<ApiResponse<number>>(`${this.apiUrl}/count`);
    }

}
