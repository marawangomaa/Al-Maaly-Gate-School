import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, } from '../Services/AuthService';
import { AccountStatus } from '../Interfaces/AccountStatus';

export const accountStatusGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  const accountStatus = auth.getAccountStatus();

  if (accountStatus === AccountStatus.Active) {
    return true;
  }


  let statusRoute = 'unknown';
  let stateData: any = {
    message: 'حالة حسابك غير معروفة. يرجى التواصل مع الدعم الفني.',
  };

  switch (accountStatus) {
    case AccountStatus.Pending:
      statusRoute = 'pending';
      stateData = {
        message: 'حسابك قيد المراجعة والموافقة من قبل إدارة المدرسة.',
      };
      break;

    case AccountStatus.Blocked:
      statusRoute = 'blocked';
      stateData = {
        message: 'حسابك موقوف مؤقتاً. يرجى التواصل مع إدارة المدرسة.'
      };
      break;

    case AccountStatus.Rejected:
      statusRoute = 'rejected';
      stateData = {
        message: 'تم رفض طلب التسجيل الخاص بك. يمكنك التواصل مع الإدارة.'
      };
      break;

    default:
      statusRoute = 'unknown';
      stateData = {
        message: 'حالة حسابك غير معروفة. يرجى التواصل مع الدعم الفني.'
      };
  }

  router.navigate(['/app/account/status', statusRoute], {
    state: stateData,
    replaceUrl: true
  });

  return false;
};

export const parentGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return accountStatusGuard(route, state);
};