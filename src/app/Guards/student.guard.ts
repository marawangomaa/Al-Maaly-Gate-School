import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/AuthService';

export const StudentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isStudent()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
