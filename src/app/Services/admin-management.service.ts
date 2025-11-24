import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { AuthService } from './auth.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiResponse } from '../Interfaces/auth';
import { Teacher } from '../Interfaces/teacher';
import { ApiResponseHandler } from '../utils/api-response-handler';


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
  //unassign-teacher
  
}


