import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AccountStatus } from '../Interfaces/AccountStatus';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

  private getStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  get token(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem('token') : null;
  }

  setToken(token: string): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem('token', token);
    }
  }

  get payload(): any | null {
    if (!this.token) return null;

    try {
      return jwtDecode(this.token);
    } catch {
      return null;
    }
  }

  get role(): string | null {
    return this.payload?.[this.roleClaim] ?? null;
  }

  get userId(): string | null {
    return this.payload?.sub ?? null;
  }

  get isTokenExpired(): boolean {
    const exp = this.payload?.exp;
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now > exp;
  }

  isLoggedIn(): boolean {
    return !!this.token && !this.isTokenExpired;
  }

  isAdmin(): boolean {
    return this.role?.toLowerCase() === 'admin';
  }

  isTeacher(): boolean {
    return this.role?.toLowerCase() === 'teacher';
  }

  isStudent(): boolean {
    return this.role?.toLowerCase() === 'student';
  }

  isParent(): boolean {
    return this.role?.toLowerCase() === 'parent';
  }

  

  getAccountStatus(): AccountStatus | null {
    const status = this.payload?.['AccountStatus'] || this.payload?.['accountStatus'];
    if (!status) return null;

    // Convert to enum value
    const statusStr = status.toLowerCase();

    // Map string to enum
    if (statusStr === 'pending') return AccountStatus.Pending;
    if (statusStr === 'blocked') return AccountStatus.Blocked;
    if (statusStr === 'rejected') return AccountStatus.Rejected;
    if (statusStr === 'active') return AccountStatus.Active;
    return null;
  }

  isAccountPending(): boolean {
    return this.getAccountStatus() === AccountStatus.Pending;
  }

  isAccountBlocked(): boolean {
    return this.getAccountStatus() === AccountStatus.Blocked;
  }

  isAccountRejected(): boolean {
    return this.getAccountStatus() === AccountStatus.Rejected;
  }

  logout(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem('token');
    }

    if (isPlatformBrowser(this.platformId)) {
      window.location.href = "/login";
    }
  }


  getUserData(): { name: string | null; email: string | null } {
    return {
      name: this.payload?.name || this.payload?.fullName || this.payload?.given_name || null,
      email: this.payload?.email || this.payload?.upn || null
    };
  }
}