import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Blocks access to a route unless a user is signed in. When unauthenticated the
 * visitor is redirected to `/login` with a `returnUrl` so they land back here
 * after signing in.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
