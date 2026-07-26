import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const supervisorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  if (user && ['supervisor', 'admin'].includes(user.role)) return true;
  router.navigate(['/rmas']);
  return false;
};
