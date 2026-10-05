import { Directive, computed, input } from '@angular/core';
import { cn } from '../utils/cn';

@Directive({ selector: '[hlmSeparator]', host: { '[class]': '_c()', role: 'separator' } })
export class HlmSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() =>
    cn(
      'shrink-0 bg-border',
      this.orientation() === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
      this.userClass(),
    ),
  );
}

@Directive({ selector: '[hlmSkeleton]', host: { '[class]': '_c()' } })
export class HlmSkeleton {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() =>
    cn('shimmer-bg animate-shimmer rounded-md', this.userClass()),
  );
}
