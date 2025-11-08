import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/AuthService';

export const RoleGuard: CanActivateFn = (route) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'];   // Admin | Teacher | Student
  const userRole = auth.role;               // from token

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (userRole === requiredRole) {
    return true;
  }

  // User logged in but not allowed
  router.navigate(['/app/home']);
  return false;
};
