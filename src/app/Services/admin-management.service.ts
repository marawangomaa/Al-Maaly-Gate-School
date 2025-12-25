import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
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
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      })
  }
  // /approve-parent-with-student
  ApproveParentWithStudent(parentId: string, studentId: string, relation: string): Observable<ApiResponse<boolean>> {

    const body = {
      parentId: parentId,
      studentId: studentId,
      relation: relation
    };

    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/approve-parent-with-student`,
      body,
      { headers: this.headers }
    );
  }

  // add-student-toExisting-parent

  AddStudentToExistingParent(parentId: string, studentId: string, relation: string): Observable<ApiResponse<boolean>> {

    const body = {
      parentId: parentId,
      studentId: studentId,
      relation: relation
    };

    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/add-student-toExisting-parent`,
      body,
      { headers: this.headers }
    );
  }

  // /remove-student-from-parent
  removeStudentToParent(parentId: string, studentId: string): Observable<ApiResponse<boolean>> {

    const body = {
      parentId: parentId,
      studentId: studentId
    };

    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/remove-student-from-parent`,
      body,
      { headers: this.headers }
    );
  }


  //Teacher
  //Count
  CountTeachers(): Observable<number> {
    const url = `${this.apiUrl}/TeacherCount`;
    return ApiResponseHandler.handleApiResponse<number>(
      this.http.get<ApiResponse<number>>(url, { headers: this.headers })
    );
  }

  CountStudents(): Observable<number> {
    const url = `${this.apiUrl}students/count`;
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

  ApproveAccount(teacherId: string, adminUserId: string, role: string): Observable<boolean> {
    const url = `${this.apiUrl}/approve-account/${teacherId}?adminUserId=${encodeURIComponent(adminUserId)}&role=${encodeURIComponent(role)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  UnblockAccount(teacherId: string, adminUserId: string, role: string): Observable<boolean> {
    const url = `${this.apiUrl}/unblock-account/${teacherId}?adminUserId=${encodeURIComponent(adminUserId)}&role=${encodeURIComponent(role)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  RejectAccount(teacherId: string, adminUserId: string, role: string): Observable<boolean> {
    const url = `${this.apiUrl}/reject-account/${teacherId}?adminUserId=${encodeURIComponent(adminUserId)}&role=${encodeURIComponent(role)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  BlockAccount(teacherId: string, adminUserId: string, role: string): Observable<boolean> {
    const url = `${this.apiUrl}/block-account/${teacherId}?adminUserId=${encodeURIComponent(adminUserId)}&role=${encodeURIComponent(role)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  //Assign Teacher To Class
  AssignTeacherToClass(teacherId: string, classId: string): Observable<boolean> {
    const url = `${this.apiUrl}/teachers/assign-class?teacherId=${encodeURIComponent(teacherId)}&classId=${encodeURIComponent(classId)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.post<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  // move-student-class
  MoveStudentToAnotherClass(studentId: string, classId: string, adminUserId: string): Observable<boolean> {
    const url = `${this.apiUrl}/move-student-class?studentId=${encodeURIComponent(studentId)}&newClassId=${encodeURIComponent(classId)}&adminUserId=${encodeURIComponent(adminUserId)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.put<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  //Assign Teacher To Subject
  AssignTeacherToSubject(teacherId: string, subjectId: string): Observable<boolean> {
    const url = `${this.apiUrl}/teachers/assign-subject?teacherId=${encodeURIComponent(teacherId)}&subjectId=${encodeURIComponent(subjectId)}`;
    return ApiResponseHandler.handleApiResponse<boolean>(
      this.http.post<ApiResponse<boolean>>(url, {}, { headers: this.headers })
    );
  }
  //unassign Teacher From Subject
  UnAssignTeacherFromSubject(teacherId: string, subjectId: string): Observable<boolean> {
    const url = `${this.apiUrl}/teachers/unassign-subject?teacherId=${encodeURIComponent(teacherId)}&subjectId=${encodeURIComponent(subjectId)}`;
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

  //student Count
  CountStudent(): Observable<number> {
    const url = `${this.apiUrl}/students/count`;
    return ApiResponseHandler.handleApiResponse<number>(
      this.http.get<ApiResponse<number>>(url, { headers: this.headers })
    );
  }

  // Helper method to build query parameters
  private buildQueryParams(params: any): string {
    return Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
  }

  // In admin-management.service.ts (or wherever you have assignment methods)
  assignTeacherToClass(teacherId: string, classId: string): Observable<any> {
    // Call the API endpoint to assign teacher to class
    return this.http.post<any>(
      `${this.apiUrl}/Teacher/${teacherId}/assign-to-class`,
      { classId: classId }
    );
  }
}