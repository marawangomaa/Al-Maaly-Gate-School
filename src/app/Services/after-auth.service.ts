import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, AuthResponse, ChangePasswordRequest, FileRecord, UpdateProfileRequest } from '../Interfaces/iafter-auth';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { CreateTeacherRequest } from '../Interfaces/i-admin-users/create-teacher-request';
import { CreateStudentRequest } from '../Interfaces/i-admin-users/create-student-request';
import { CreateParentRequest } from '../Interfaces/i-admin-users/create-parent-request';
import { AppUser } from '../Interfaces/i-admin-users/app-user';
import { CreateUserExcelModel } from '../Interfaces/i-admin-users/create-user-excel-model';

@Injectable({
  providedIn: 'root'
})
export class AfterAuthService {

  private baseUrl = `${environment.apiUrl}/afterauthentication`;
  private token: string | null;
  private headers: HttpHeaders;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.token = this.authService.getToken();
    this.headers = new HttpHeaders(
      {
        'Authorization': `Bearer ${this.token}`
      })
  }

  private getFormDataHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Note: Don't set Content-Type for FormData, let browser set it
    });
  }
  //create users
  createTeacher(
    request: CreateTeacherRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/create-teacher`,
      request,
      { headers: this.headers }
    );
  }
  createStudent(
    request: CreateStudentRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/create-student`,
      request,
      { headers: this.headers }
    );
  }
  createParent(
    request: CreateParentRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/create-parent`,
      request,
      { headers: this.headers }
    );
  }
  // Bulk create users excel
  bulkCreateUsers(
    userType: 'teacher' | 'student' | 'parent',
    users: CreateUserExcelModel[]
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/bulk-create-users`,
      { userType, users },
      { headers: this.headers }
    );
  }
  // ====================== Pending roles ======================
  getPendingTeachers(): Observable<ApiResponse<AppUser[]>> {
    return this.http.get<ApiResponse<AppUser[]>>(
      `${this.baseUrl}/pending-teachers`,
      { headers: this.headers }
    );
  }


  getPendingStudents(): Observable<ApiResponse<AppUser[]>> {
    return this.http.get<ApiResponse<AppUser[]>>(
      `${this.baseUrl}/pending-students`,
      { headers: this.headers }
    );
  }


  getPendingParents(): Observable<ApiResponse<AppUser[]>> {
    return this.http.get<ApiResponse<AppUser[]>>(
      `${this.baseUrl}/pending-parents`,
      { headers: this.headers }
    );
  }

  // Logout
  logout(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/logout`,
      {},
      { headers: this.headers }
    );
  }

  // Get current user profile
  getCurrentUser(): Observable<ApiResponse<AuthResponse>> {
    return this.http.get<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/profile`, { headers: this.headers }
    );
  }

  // Change password
  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/change-password`,
      request, { headers: this.headers }
    );
  }

  // Delete account
  deleteAccount(): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.baseUrl}/delete-account`, { headers: this.headers }
    );
  }

  // Update profile
  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.put<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/update-profile`,
      request, { headers: this.headers }
    );
  }

  // Add debugging to see what you're sending
  uploadProfilePhoto(file: File): Observable<ApiResponse<AuthResponse>> {
    const formData = new FormData();
    formData.append('File', file); // Capital F to match [FromForm(Name = "File")]

    // Debug: Show all FormData entries
    console.log('FormData contents:');
    for (let pair of (formData as any).entries()) {
      console.log(pair[0], ':', pair[1]);
    }

    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/profile/photo`,
      formData,
      { headers: this.headers }
    ).pipe(
      tap(response => console.log('Upload success:', response)),
      catchError(error => {
        console.error('Upload failed:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  // Get user's files
  getMyFiles(): Observable<ApiResponse<FileRecord[]>> {
    return this.http.get<ApiResponse<FileRecord[]>>(
      `${this.baseUrl}/my-files`, { headers: this.headers }
    );
  }
}
