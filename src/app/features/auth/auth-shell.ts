import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMonitor,
  lucideMoon,
  lucideShieldCheck,
  lucideSparkles,
  lucideSun,
  lucideTruck,
  lucideStar,
} from '@ng-icons/lucide';
import { ThemeService } from '../../core/theme.service';

interface FloatCard {
  label: string;
  sub: string;
  icon: string;
  pos: string;
  delay: string;
}

/**
 * Immersive animated backdrop + centered glass panel used by the auth pages.
 * Projected content is the actual form card body.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideMonitor,
      lucideMoon,
      lucideShieldCheck,
      lucideSparkles,
      lucideSun,
      lucideTruck,
      lucideStar,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative min-h-screen overflow-hidden bg-background">
      <!-- Aurora backdrop -->
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div
          class="absolute left-[-15%] top-[-20%] h-[55vw] w-[55vw] rounded-full bg-accent/40 blur-[120px] animate-aurora"
        ></div>
        <div
          class="absolute right-[-15%] top-[10%] h-[48vw] w-[48vw] rounded-full blur-[120px] animate-aurora"
          style="background:color-mix(in oklch, var(--chart-5), transparent 55%);animation-delay:-6s"
        ></div>
        <div
          class="absolute bottom-[-25%] left-[25%] h-[50vw] w-[50vw] rounded-full blur-[120px] animate-aurora"
          style="background:color-mix(in oklch, var(--chart-2), transparent 55%);animation-delay:-12s"
        ></div>
        <div
          class="absolute inset-0 bg-dots opacity-40"
          style="mask-image:radial-gradient(ellipse at center, black 30%, transparent 75%)"
        ></div>
      </div>

      <!-- Top bar -->
      <div class="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8">
        <a
          routerLink="/"
          class="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3.5 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:border-accent/50 hover:text-foreground"
        >
          <ng-icon
            name="lucideArrowLeft"
            size="16"
            class="transition-transform group-hover:-translate-x-0.5"
          />
          Back to store
        </a>
        <button
          type="button"
          (click)="toggleTheme()"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/50 text-foreground backdrop-blur transition-all hover:border-accent/50 hover:text-accent"
          aria-label="Toggle theme"
        >
          @switch (theme.mode()) {
            @case ('light') {
              <ng-icon name="lucideSun" size="18" />
            }
            @case ('dark') {
              <ng-icon name="lucideMoon" size="18" />
            }
            @default {
              <ng-icon name="lucideMonitor" size="18" />
            }
          }
        </button>
      </div>

      <!-- Centered content -->
      <div class="relative z-10 flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-6">
        <div class="w-full max-w-md">
          <!-- Brand -->
          <div class="mb-6 flex flex-col items-center text-center animate-fade-down">
            <a routerLink="/" class="group relative mb-5 inline-flex">
              <span
                class="absolute inset-0 rounded-2xl bg-accent/40 blur-xl animate-pulse-glow"
              ></span>
              <span
                class="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg transition-transform group-hover:scale-105"
                >N</span
              >
            </a>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
            >
              <ng-icon name="lucideSparkles" size="13" />
              {{ badge() }}
            </span>
          </div>

          <!-- Glass card -->
          <div
            class="gradient-ring animate-zoom-in rounded-3xl border border-border/60 bg-card/70 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
          >
            <ng-content />
          </div>

          <!-- Trust strip -->
          <div
            class="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground animate-fade-up delay-300"
          >
            <span class="inline-flex items-center gap-1.5">
              <ng-icon name="lucideShieldCheck" size="15" class="text-success" /> Secure
            </span>
            <span class="inline-flex items-center gap-1.5">
              <ng-icon name="lucideTruck" size="15" class="text-accent" /> Free shipping
            </span>
            <span class="inline-flex items-center gap-1.5">
              <ng-icon name="lucideStar" size="15" class="text-amber-500" /> 4.9/5 rated
            </span>
          </div>
        </div>
      </div>

      <!-- Floating product cards (desktop flourish) -->
      @for (c of floats; track c.label) {
        <div
          class="pointer-events-none absolute z-0 hidden xl:flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 shadow-xl backdrop-blur-md animate-float"
          [class]="c.pos"
          [style.animationDelay]="c.delay"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent"
          >
            <ng-icon [name]="c.icon" size="18" />
          </span>
          <div class="text-left">
            <div class="text-sm font-semibold text-foreground">{{ c.label }}</div>
            <div class="text-xs text-muted-foreground">{{ c.sub }}</div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AuthShell {
  protected readonly theme = inject(ThemeService);
  readonly badge = input('Premium members club');

  protected readonly floats: FloatCard[] = [
    {
      label: 'Order shipped',
      sub: 'Arriving tomorrow',
      icon: 'lucideTruck',
      pos: 'left-[6%] top-[24%]',
      delay: '-1s',
    },
    {
      label: '4.9 rating',
      sub: '12,480 reviews',
      icon: 'lucideStar',
      pos: 'right-[7%] top-[30%]',
      delay: '-3s',
    },
    {
      label: '100% secure',
      sub: 'Encrypted checkout',
      icon: 'lucideShieldCheck',
      pos: 'left-[9%] bottom-[12%]',
      delay: '-5s',
    },
  ];

  toggleTheme(): void {
    const order = ['light', 'dark', 'system'] as const;
    const next = order[(order.indexOf(this.theme.mode()) + 1) % order.length];
    this.theme.set(next);
  }
}
