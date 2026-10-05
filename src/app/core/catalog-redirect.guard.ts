import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Redirects curated shortcut routes (New Arrivals, Best Sellers, Deals) to the
 * catalogue with pre-applied query params. `route.data['redirectQuery']` holds
 * the query params to forward.
 */
export const catalogRedirectGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const queryParams = (route.data['redirectQuery'] as Record<string, string>) ?? {};
  return router.createUrlTree(['/catalog'], { queryParams });
};
