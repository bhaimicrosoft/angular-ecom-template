import { ChangeDetectionStrategy, Component, computed, inject, isDevMode } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { Header } from './layout/header';
import { Footer } from './layout/footer';
import { Toaster } from './shared/ui/toaster';
import { Customizer } from './shared/customizer/customizer';

const CHROMELESS_ROUTES = ['/login', '/signup'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Toaster, Customizer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showChrome()) {
      <app-header />
      <main class="min-h-[60vh]">
        <router-outlet />
      </main>
      <app-footer />
    } @else {
      <router-outlet />
    }
    <app-toaster />

    <!-- Dev-only visual customizer. Lazy-loaded and never shipped to production. -->
    @defer (when devMode) {
      @if (devMode) {
        <app-customizer />
      }
    }
  `,
})
export class App {
  private readonly router = inject(Router);

  /** True under `ng serve` / dev builds; false in production builds. */
  protected readonly devMode = isDevMode();

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showChrome = computed(
    () => !CHROMELESS_ROUTES.some((r) => this.url().startsWith(r)),
  );
}
