import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideMail,
  lucideLock,
  lucideSun,
  lucideMoon,
  lucideMonitor,
  lucideBell,
  lucideCheck,
  lucideShieldCheck,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { AuthService } from '../../core/auth.service';
import { ThemeService, ThemeMode } from '../../core/theme.service';
import { ToastService } from '../../core/toast.service';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';

interface ToggleRow {
  key: string;
  label: string;
  desc: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, HlmButton, HlmInput, HlmLabel],
  providers: [
    provideIcons({
      lucideUser,
      lucideMail,
      lucideLock,
      lucideSun,
      lucideMoon,
      lucideMonitor,
      lucideBell,
      lucideCheck,
      lucideShieldCheck,
      lucideTriangleAlert,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="mb-6 text-xl font-bold tracking-tight">Settings</h2>

    <div class="space-y-6">
      <!-- Profile -->
      <section class="rounded-2xl border border-border bg-card p-6 animate-fade-up">
        <h3 class="font-semibold">Profile</h3>
        <p class="text-sm text-muted-foreground">Update your personal information.</p>
        <div class="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div class="relative">
            <div class="h-20 w-20 overflow-hidden rounded-2xl bg-primary text-primary-foreground">
              @if (avatar()) {
                <img [src]="avatar()" alt="" class="h-full w-full object-cover" />
              } @else {
                <span class="flex h-full w-full items-center justify-center text-2xl font-bold">{{ auth.initials() }}</span>
              }
            </div>
          </div>
          <div class="grid flex-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label hlmLabel>Full name</label>
              <div class="relative">
                <ng-icon name="lucideUser" size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input hlmInput class="pl-10" [ngModel]="name()" (ngModelChange)="name.set($event)" />
              </div>
            </div>
            <div class="space-y-2">
              <label hlmLabel>Email</label>
              <div class="relative">
                <ng-icon name="lucideMail" size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input hlmInput type="email" class="pl-10" [ngModel]="email()" (ngModelChange)="email.set($event)" />
              </div>
            </div>
            <div class="space-y-2 sm:col-span-2">
              <label hlmLabel>Avatar URL</label>
              <input hlmInput placeholder="https://…" [ngModel]="avatar()" (ngModelChange)="avatar.set($event)" />
            </div>
          </div>
        </div>
        <div class="mt-5">
          <button hlmBtn variant="accent" (click)="saveProfile()" [disabled]="!profileDirty() || auth.loading()">
            @if (auth.loading()) { <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span> Saving… }
            @else { <ng-icon name="lucideCheck" size="17" /> Save changes }
          </button>
        </div>
      </section>

      <!-- Password -->
      <section class="rounded-2xl border border-border bg-card p-6 animate-fade-up delay-100">
        <h3 class="font-semibold">Password</h3>
        <p class="text-sm text-muted-foreground">Choose a strong password you don't use elsewhere.</p>
        @if (pwError()) {
          <div class="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <ng-icon name="lucideTriangleAlert" size="16" /> {{ pwError() }}
          </div>
        }
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label hlmLabel>Current password</label>
            <input hlmInput type="password" [ngModel]="currentPw()" (ngModelChange)="currentPw.set($event)" />
          </div>
          <div class="space-y-2">
            <label hlmLabel>New password</label>
            <input hlmInput type="password" [ngModel]="newPw()" (ngModelChange)="newPw.set($event)" />
          </div>
        </div>
        <div class="mt-5">
          <button hlmBtn variant="outline" (click)="changePassword()" [disabled]="!currentPw() || !newPw() || auth.loading()">
            <ng-icon name="lucideLock" size="16" /> Update password
          </button>
        </div>
      </section>

      <!-- Appearance -->
      <section class="rounded-2xl border border-border bg-card p-6 animate-fade-up delay-200">
        <h3 class="font-semibold">Appearance</h3>
        <p class="text-sm text-muted-foreground">Choose how Nova looks to you.</p>
        <div class="mt-5 grid gap-3 sm:grid-cols-3">
          @for (opt of themeOptions; track opt.value) {
            <button
              type="button"
              (click)="theme.set(opt.value)"
              class="flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all"
              [class]="theme.mode() === opt.value ? 'border-accent bg-accent/8' : 'border-border hover:border-accent/40'"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <ng-icon [name]="opt.icon" size="19" />
              </span>
              <div>
                <p class="text-sm font-semibold">{{ opt.label }}</p>
                <p class="text-xs text-muted-foreground">{{ opt.desc }}</p>
              </div>
              @if (theme.mode() === opt.value) {
                <ng-icon name="lucideCheck" size="18" class="ml-auto text-accent" />
              }
            </button>
          }
        </div>
      </section>

      <!-- Notifications -->
      <section class="rounded-2xl border border-border bg-card p-6 animate-fade-up delay-300">
        <h3 class="font-semibold">Notifications</h3>
        <p class="text-sm text-muted-foreground">Decide what we email you about.</p>
        <ul class="mt-5 divide-y divide-border">
          @for (row of toggles; track row.key) {
            <li class="flex items-center justify-between py-4">
              <div>
                <p class="text-sm font-medium">{{ row.label }}</p>
                <p class="text-xs text-muted-foreground">{{ row.desc }}</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="notif()[row.key]"
                (click)="toggleNotif(row.key)"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors"
                [class]="notif()[row.key] ? 'bg-accent' : 'bg-input'"
              >
                <span
                  class="h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                  [class]="notif()[row.key] ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class AccountSettings {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);

  protected readonly name = signal(this.auth.user()?.name ?? '');
  protected readonly email = signal(this.auth.user()?.email ?? '');
  protected readonly avatar = signal(this.auth.user()?.avatarUrl ?? '');

  protected readonly currentPw = signal('');
  protected readonly newPw = signal('');
  protected readonly pwError = signal('');

  protected readonly notif = signal<Record<string, boolean>>({
    orders: true,
    promos: true,
    drops: false,
    newsletter: true,
  });

  protected readonly profileDirty = computed(() => {
    const u = this.auth.user();
    return (
      this.name() !== (u?.name ?? '') ||
      this.email() !== (u?.email ?? '') ||
      this.avatar() !== (u?.avatarUrl ?? '')
    );
  });

  protected readonly themeOptions: { value: ThemeMode; label: string; desc: string; icon: string }[] = [
    { value: 'light', label: 'Light', desc: 'Bright & clean', icon: 'lucideSun' },
    { value: 'dark', label: 'Dark', desc: 'Easy on the eyes', icon: 'lucideMoon' },
    { value: 'system', label: 'System', desc: 'Match device', icon: 'lucideMonitor' },
  ];

  protected readonly toggles: ToggleRow[] = [
    { key: 'orders', label: 'Order updates', desc: 'Shipping and delivery alerts' },
    { key: 'promos', label: 'Promotions', desc: 'Discounts and special offers' },
    { key: 'drops', label: 'New drops', desc: 'Early access to launches' },
    { key: 'newsletter', label: 'Newsletter', desc: 'Weekly product roundup' },
  ];

  async saveProfile(): Promise<void> {
    await this.auth.updateProfile({ name: this.name().trim(), email: this.email().trim(), avatarUrl: this.avatar().trim() });
    this.toast.success('Profile updated');
  }

  async changePassword(): Promise<void> {
    this.pwError.set('');
    try {
      await this.auth.changePassword(this.currentPw(), this.newPw());
      this.currentPw.set('');
      this.newPw.set('');
      this.toast.success('Password updated');
    } catch (err) {
      this.pwError.set(err instanceof Error ? err.message : 'Could not update password.');
    }
  }

  toggleNotif(key: string): void {
    this.notif.update((n) => ({ ...n, [key]: !n[key] }));
  }
}
