import { inject, Injectable } from '@angular/core';
import { environment } from '../Environment/Environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest } from '../Interfaces/auth';
import { Observable, tap } from 'rxjs';
import { StorageUtil } from '../utils/storage.util';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/Authentication`;

  // ---------------------------------------------------
  //                     API CALLS
  // ---------------------------------------------------

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request)
      .pipe(
        tap(res => {
          if (res.success) this.handleAuth(res.data);
        })
      );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/register`, request)
      .pipe(
        tap(res => {
          if (res.success) this.handleAuth(res.data);
        })
      );
  }

  refresh(request: RefreshTokenRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/refresh-token`, request)
      .pipe(
        tap(res => {
          if (res.success) this.handleAuth(res.data);
        })
      );
  }

  logout(): void {
    StorageUtil.clear();
  }

  // ---------------------------------------------------
  //               TOKEN + USER HELPERS
  // ---------------------------------------------------

  getToken(): string | null {
    return StorageUtil.get('token');
  }

  getRefreshToken(): string | null {
    return StorageUtil.get('refreshToken');
  }

  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  // ✅ Get array of roles from JWT (Admin / Teacher / Student)
  getRoles(): string[] {
    const decoded = this.decodeToken();
    if (!decoded) return [];

    return decoded.roles
      || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      || [];
  }

  // ✅ Get a single first role
  getRole(): string | null {
    const roles = this.getRoles();
    return roles.length ? roles[0] : null;
  }

  // ✅ Extract teacherId if exists inside token
  getTeacherId(): string | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;

    return decoded.teacherId
      || decoded['TeacherId']
      || null;
  }

  // ✅ Used for guards & navbar
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken();
    if (!decoded?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }

  // ---------------------------------------------------
  //                 SAVE LOGIN DATA
  // ---------------------------------------------------

  private handleAuth(auth: AuthResponse) {
    StorageUtil.set('token', auth.token);
    StorageUtil.set('refreshToken', auth.refreshToken);

    // save user basic profile (not roles)
    StorageUtil.set('user', JSON.stringify({
      userId: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
      userName: auth.userName,
      roleEntityIds: auth.roleEntityIds.studentId
    }));
  }

  getStudentId(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user')!;
      const user = JSON.parse(userStr);
      return user.roleEntityIds
    }
    return null;
  }
}
