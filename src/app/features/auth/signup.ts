import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideEye,
  lucideEyeOff,
  lucideLock,
  lucideMail,
  lucideMonitor,
  lucideMoon,
  lucideSun,
  lucideUser,
} from '@ng-icons/lucide';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ToastService } from '../../core/toast.service';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';
import { AuthShell } from './auth-shell';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIcon, HlmButton, HlmInput, HlmLabel, AuthShell],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideEye,
      lucideEyeOff,
      lucideLock,
      lucideMail,
      lucideMonitor,
      lucideMoon,
      lucideSun,
      lucideUser,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.html',
})
export class Signup {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  protected readonly theme = inject(ThemeService);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly agree = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly error = signal('');

  protected readonly loading = this.auth.loading;

  protected readonly strength = computed(() => {
    const p = this.password();
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(4, score);
  });

  protected readonly strengthLabel = computed(
    () => ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][this.strength()],
  );

  protected readonly rules = computed(() => {
    const p = this.password();
    return {
      length: p.length >= 6,
      case: /[A-Z]/.test(p) && /[a-z]/.test(p),
      number: /\d/.test(p),
    };
  });

  protected readonly canSubmit = computed(
    () =>
      this.name().trim().length > 0 &&
      this.email().trim().length > 0 &&
      this.password().length >= 6 &&
      this.agree() &&
      !this.loading(),
  );

  toggleTheme(): void {
    const order = ['light', 'dark', 'system'] as const;
    const next = order[(order.indexOf(this.theme.mode()) + 1) % order.length];
    this.theme.set(next);
  }

  async submit(): Promise<void> {
    this.error.set('');
    if (!this.agree()) {
      this.error.set('Please accept the Terms to create your account.');
      return;
    }
    try {
      const user = await this.auth.signup({
        name: this.name().trim(),
        email: this.email().trim(),
        password: this.password(),
      });
      this.toast.success(`Welcome to Nova, ${user.name.split(' ')[0]}!`);
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
      this.error.set('Could not sign up with that provider. Please try again.');
    }
  }

  private async redirect(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    await this.router.navigateByUrl(returnUrl);
  }
}
