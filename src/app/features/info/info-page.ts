import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSparkles,
  lucideBriefcase,
  lucideNewspaper,
  lucideLeaf,
  lucideCircleHelp,
  lucideTruck,
  lucideRotateCcw,
  lucideShieldCheck,
  lucideFileText,
  lucideArrowRight,
  lucideChevronRight,
  lucideCheck,
} from '@ng-icons/lucide';
import { HlmButton } from '../../shared/ui/button';
import { INFO_PAGES, InfoPageData } from './info-content';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [RouterLink, NgIcon, HlmButton],
  providers: [
    provideIcons({
      lucideSparkles,
      lucideBriefcase,
      lucideNewspaper,
      lucideLeaf,
      lucideCircleHelp,
      lucideTruck,
      lucideRotateCcw,
      lucideShieldCheck,
      lucideFileText,
      lucideArrowRight,
      lucideChevronRight,
      lucideCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page(); as p) {
      <!-- Hero -->
      <section class="relative overflow-hidden border-b border-border">
        <div class="absolute inset-0 -z-10 bg-gradient-to-br opacity-[0.12] {{ p.gradient }}"></div>
        <div class="absolute -top-24 right-0 -z-10 h-72 w-72 rounded-full bg-gradient-to-br blur-3xl opacity-30 animate-blob {{ p.gradient }}"></div>
        <div class="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <span
            class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg animate-zoom-in {{ p.gradient }}"
          >
            <ng-icon [name]="p.icon" size="30" />
          </span>
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent animate-fade-down">{{ p.eyebrow }}</p>
          <h1 class="text-balance text-4xl font-bold tracking-tight sm:text-5xl animate-fade-up">{{ p.title }}</h1>
          <p class="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground animate-fade-up delay-100">{{ p.lead }}</p>
        </div>
      </section>

      <div class="mx-auto max-w-5xl px-4 py-16">
        <!-- Stats -->
        @if (p.stats?.length) {
          <div class="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            @for (s of p.stats; track s.label; let i = $index) {
              <div
                class="rounded-2xl border border-border bg-card p-6 text-center animate-fade-up"
                [style.animation-delay.ms]="i * 80"
              >
                <p class="bg-gradient-to-br bg-clip-text text-3xl font-bold text-transparent {{ p.gradient }}">{{ s.value }}</p>
                <p class="mt-1 text-sm text-muted-foreground">{{ s.label }}</p>
              </div>
            }
          </div>
        }

        <!-- Sections -->
        @if (p.sections?.length) {
          <div class="grid gap-8 md:grid-cols-2">
            @for (sec of p.sections; track sec.heading) {
              <div class="rounded-2xl border border-border bg-card p-8 animate-fade-up">
                @if (sec.heading) { <h2 class="text-xl font-semibold tracking-tight">{{ sec.heading }}</h2> }
                @if (sec.body) { <p class="mt-3 text-muted-foreground">{{ sec.body }}</p> }
                @if (sec.bullets?.length) {
                  <ul class="mt-4 space-y-3">
                    @for (b of sec.bullets; track b) {
                      <li class="flex items-start gap-3 text-sm">
                        <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                          <ng-icon name="lucideCheck" size="13" />
                        </span>
                        <span>{{ b }}</span>
                      </li>
                    }
                  </ul>
                }
              </div>
            }
          </div>
        }

        <!-- FAQs -->
        @if (p.faqs?.length) {
          <div class="mx-auto max-w-3xl space-y-3">
            @for (f of p.faqs; track f.q) {
              <details class="group rounded-2xl border border-border bg-card p-5 transition-colors open:border-accent/40">
                <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {{ f.q }}
                  <ng-icon
                    name="lucideChevronRight"
                    size="18"
                    class="shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                  />
                </summary>
                <p class="mt-3 text-sm text-muted-foreground">{{ f.a }}</p>
              </details>
            }
          </div>
        }

        <!-- CTA -->
        @if (p.cta; as c) {
          <div class="mt-16 overflow-hidden rounded-3xl border border-border bg-gradient-to-br p-10 text-center {{ p.gradient }}">
            <div class="rounded-2xl bg-card/85 p-8 backdrop-blur">
              <h2 class="text-2xl font-bold tracking-tight">{{ c.title }}</h2>
              <p class="mx-auto mt-2 max-w-md text-muted-foreground">{{ c.body }}</p>
              <a hlmBtn variant="accent" size="lg" class="mt-6" [routerLink]="c.link">
                {{ c.label }} <ng-icon name="lucideArrowRight" size="18" />
              </a>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class InfoPage {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  protected readonly page = computed<InfoPageData | undefined>(() => {
    const key = this.data()['page'] as string | undefined;
    return key ? INFO_PAGES[key] : undefined;
  });
}
