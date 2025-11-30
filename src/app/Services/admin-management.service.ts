import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { AuthService } from './auth.service';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiResponse } from '../Interfaces/auth';
import { Teacher } from '../Interfaces/teacher';
import { ApiResponseHandler } from '../utils/api-response-handler';
import { BulkAssignTeachersDto } from '../Interfaces/iteacher';

@Injectable({
  providedIn: 'root'
})
export class AdminManagementService {

  private apiUrl: string = `${environment.apiBaseUrl}/AdminManagement`;
  private token: string | null;
  private headers: HttpHeaders;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.token = this.authService.getToken();
    this.headers = new HttpHeaders(
      {
        'Authorization': `Bearer ${this.token}`
      })
  }
  
  //Teacher
  //Count
  CountTeachers(): Observable<number> {
    const url = `${this.apiUrl}/TeacherCount`;
    return ApiResponseHandler.handleApiResponse<number>(
      this.http.get<ApiResponse<number>>(url, { headers: this.headers })
    );
  }
  
  //Teacher By Subject Name
  GetTeachersBySubjectName(subjectName: string): Observable<Teacher[]> {
    const url = `${this.apiUrl}/TeacherBySubject?subjectName=${encodeURIComponent(subjectName)}`;
    return ApiResponseHandler.handleApiResponse<Teacher[]>(
      this.http.get<ApiResponse<Teacher[]>>(url, { headers: this.headers })
    );
  }
  
  //approve-teacher
  ApproveTeacher(teacherId: string, adminUserId: string): Observable<boolean> {
    const url = `${this.apiUrl}/approve-teacher/${teacherId}?adminUserId=${encodeURIComponent(adminUserId)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  
  //reject-teacher
  RejectTeacher(teacherId: string, adminNotifyUserId: string): Observable<boolean> {
    const url = `${this.apiUrl}/reject-teacher/${teacherId}?notifyCreatorUserId=${encodeURIComponent(adminNotifyUserId)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  
  //Assign Teacher To Class
  AssignTeacherToClass(teacherId : string, classId:string): Observable<boolean> 
  {
      const url = `${this.apiUrl}/teachers/assign-class?teacherId=${encodeURIComponent(teacherId)}&classId=${encodeURIComponent(classId)}`;
      return ApiResponseHandler.handleApiResponse<boolean>(
        this.http.post<ApiResponse<boolean>>(url, {}, { headers: this.headers })
      );
  }
  
  //Assign Teacher To Subject
  AssignTeacherToSubject(teacherId : string, subjectId:string): Observable<boolean> 
  {
      const url = `${this.apiUrl}/teachers/assign-subject?teacherId=${encodeURIComponent(teacherId)}&subjectId=${encodeURIComponent(subjectId)}`;
      return ApiResponseHandler.handleApiResponse<boolean>(
        this.http.post<ApiResponse<boolean>>(url, {}, { headers: this.headers })
      );
  }
  
  getTeachersByClass(classId: string): Observable<any> {
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/teachers/class/${classId}`, { headers: this.headers });
}

  unassignTeacherFromClass(teacherId: string, classId: string): Observable<any> {
    return ApiResponseHandler.handleApiResponse<any>(
      this.http.delete<ApiResponse<any>>(`${this.apiUrl}/teachers/unassign-from-class?teacherId=${teacherId}&classId=${classId}`, { headers: this.headers })
    );
  }

  bulkAssignTeachers(dto: BulkAssignTeachersDto): Observable<any> {
    return ApiResponseHandler.handleApiResponse<any>(
      this.http.post<ApiResponse<any>>(`${this.apiUrl}/bulk-assign-teachers`, dto, { headers: this.headers })
    );
  }

  // Move Student to Another Class
moveStudentToAnotherClass(studentId: string, newClassId: string | null, adminUserId: string): Observable<boolean> {
  // Handle null newClassId (unassigning student)
  const params: any = {
    studentId: encodeURIComponent(studentId),
    adminUserId: encodeURIComponent(adminUserId)
  };
  
  // Only add newClassId if it's not null
  if (newClassId !== null && newClassId !== undefined) {
    params.newClassId = encodeURIComponent(newClassId);
  }

  const url = `${this.apiUrl}/move-student-class?${this.buildQueryParams(params)}`;
  
  return ApiResponseHandler.handleApiResponse<boolean>(
    this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
  );
}

// Helper method to build query parameters
private buildQueryParams(params: any): string {
  return Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');
}
}