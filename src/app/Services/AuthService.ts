import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private platformId = inject(PLATFORM_ID);

  private roleClaim =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

  // ✅ Safe localStorage getter for SSR (browser check)
  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  // ✅ Get token
  get token(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem('token') : null;
  }

  // ✅ Decode token payload
  get payload(): any | null {
    if (!this.token) return null;

    try {
      return jwtDecode(this.token);
    } catch {
      return null;
    }
  }

  // ✅ Read role from the correct claim
  get role(): string | null {
    return this.payload?.[this.roleClaim] ?? null;
  }

  // ✅ User ID = sub
  get userId(): string | null {
    return this.payload?.sub ?? null;
  }

  // ✅ Optional helpers (useful later)
  get email(): string | null {
    return this.payload?.email ?? null;
  }

  get name(): string | null {
    return this.payload?.name ?? null;
  }

  get exp(): number | null {
    return this.payload?.exp ?? null;
  }

  // ✅ Check if token expired
  get isTokenExpired(): boolean {
    if (!this.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now > this.exp;
  }

  // ✅ Required "old API" — keeps your old methods exactly
  isAdmin() {
    return this.role?.toLowerCase() === 'admin';
  }

  isTeacher() {
    return this.role?.toLowerCase() === 'teacher';
  }

  isStudent() {
    return this.role?.toLowerCase() === 'student';
  }

  // ✅ isLoggedIn now also checks expiration
  isLoggedIn(): boolean {
    return !!this.token && !this.isTokenExpired;
  }

  // ✅ logout
  logout() {
    const storage = this.getStorage();
    if (storage) storage.removeItem('token');

    if (isPlatformBrowser(this.platformId)) {
      window.location.href = "/login";
    }
  }
}
