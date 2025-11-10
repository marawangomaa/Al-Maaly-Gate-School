import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/AuthService';

export const NonAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  // ✅ Already logged in → redirect to their dashboard
  const role = auth.role?.toLowerCase();

  if (role === 'admin') router.navigate(['/app/dashboard/overview']);
  if (role === 'teacher') router.navigate(['/app/dashboard/teacher-overview']);
  if (role === 'student') router.navigate(['/app/dashboard/grades']);

  return false;
};
