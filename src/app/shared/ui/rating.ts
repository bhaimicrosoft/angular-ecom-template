import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideStar } from '@ng-icons/lucide';
import { cn } from '../utils/cn';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideStar })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1" [class]="containerClass()">
      <div class="relative inline-flex">
        <!-- base -->
        <div class="flex" [style.gap.px]="gap()">
          @for (s of stars(); track $index) {
            <ng-icon name="lucideStar" [size]="sizePx()" class="text-muted-foreground/30" />
          }
        </div>
        <!-- filled overlay -->
        <div
          class="absolute inset-0 flex overflow-hidden"
          [style.gap.px]="gap()"
          [style.width.%]="fillPercent()"
        >
          @for (s of stars(); track $index) {
            <ng-icon
              name="lucideStar"
              [size]="sizePx()"
              class="shrink-0 text-accent [&_svg]:fill-accent"
            />
          }
        </div>
      </div>
      @if (showCount()) {
        <span class="text-xs text-muted-foreground">({{ count() }})</span>
      }
    </div>
  `,
})
export class Rating {
  readonly value = input<number>(0);
  readonly count = input<number>(0);
  readonly showCount = input<boolean>(false);
  readonly size = input<'sm' | 'md' | 'lg'>('sm');
  readonly containerClass = input<string>('');

  protected readonly stars = computed(() => Array.from({ length: 5 }));
  protected readonly sizePx = computed(() => ({ sm: '14', md: '18', lg: '22' })[this.size()]);
  protected readonly gap = computed(() => ({ sm: 2, md: 3, lg: 4 })[this.size()]);
  protected readonly fillPercent = computed(() =>
    Math.max(0, Math.min(100, (this.value() / 5) * 100)),
  );
}
