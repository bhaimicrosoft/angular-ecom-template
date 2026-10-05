import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideEye,
  lucideEyeOff,
  lucideLock,
  lucideMail,
  lucideMonitor,
  lucideMoon,
  lucideSun,
  lucideCircleAlert,
} from '@ng-icons/lucide';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ToastService } from '../../core/toast.service';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';
import { AuthShell } from './auth-shell';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIcon, HlmButton, HlmInput, HlmLabel, AuthShell],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideEye,
      lucideEyeOff,
      lucideLock,
      lucideMail,
      lucideMonitor,
      lucideMoon,
      lucideSun,
      lucideCircleAlert,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  protected readonly theme = inject(ThemeService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly remember = signal(true);
  protected readonly showPassword = signal(false);
  protected readonly error = signal('');

  protected readonly loading = this.auth.loading;
  protected readonly canSubmit = computed(
    () => this.email().trim().length > 0 && this.password().length > 0 && !this.loading(),
  );

  toggleTheme(): void {
    const order = ['light', 'dark', 'system'] as const;
    const next = order[(order.indexOf(this.theme.mode()) + 1) % order.length];
    this.theme.set(next);
  }

  async submit(): Promise<void> {
    this.error.set('');
    try {
      const user = await this.auth.login({ email: this.email().trim(), password: this.password() });
      this.toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      await this.redirect();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  async social(provider: 'google' | 'apple' | 'github'): Promise<void> {
    this.error.set('');
    try {
      const user = await this.auth.loginWithProvider(provider);
      this.toast.success(`Signed in as ${user.name}`);
      await this.redirect();
    } catch {
      this.error.set('Could not sign in with that provider. Please try again.');
    }
  }

  private async redirect(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    await this.router.navigateByUrl(returnUrl);
  }
}
