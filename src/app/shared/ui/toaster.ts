import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideBell, lucideHeart } from '@ng-icons/lucide';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideCircleCheck, lucideBell, lucideHeart })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
    >
      @for (toast of toaster.toasts(); track toast.id) {
        <div
          class="glass pointer-events-auto flex items-center gap-3 rounded-xl border border-border px-4 py-3 shadow-lg animate-slide-in-right"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            [class]="
              toast.variant === 'success'
                ? 'bg-success/15 text-success'
                : toast.variant === 'accent'
                  ? 'bg-accent/15 text-accent'
                  : 'bg-primary/10 text-foreground'
            "
          >
            <ng-icon [name]="toast.icon ?? 'lucideBell'" size="18" />
          </span>
          <p class="text-sm font-medium text-foreground">{{ toast.message }}</p>
        </div>
      }
    </div>
  `,
})
export class Toaster {
  protected readonly toaster = inject(ToastService);
}
