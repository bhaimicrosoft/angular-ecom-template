import { Directive, computed, input } from '@angular/core';
import { cn } from '../utils/cn';

@Directive({ selector: '[hlmCard]', host: { '[class]': '_c()' } })
export class HlmCard {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() =>
    cn(
      'rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300',
      this.userClass(),
    ),
  );
}

@Directive({ selector: '[hlmCardHeader]', host: { '[class]': '_c()' } })
export class HlmCardHeader {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() => cn('flex flex-col space-y-1.5 p-6', this.userClass()));
}

@Directive({ selector: '[hlmCardTitle]', host: { '[class]': '_c()' } })
export class HlmCardTitle {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() =>
    cn('font-semibold leading-none tracking-tight', this.userClass()),
  );
}

@Directive({ selector: '[hlmCardDescription]', host: { '[class]': '_c()' } })
export class HlmCardDescription {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() => cn('text-sm text-muted-foreground', this.userClass()));
}

@Directive({ selector: '[hlmCardContent]', host: { '[class]': '_c()' } })
export class HlmCardContent {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() => cn('p-6 pt-0', this.userClass()));
}

@Directive({ selector: '[hlmCardFooter]', host: { '[class]': '_c()' } })
export class HlmCardFooter {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() => cn('flex items-center p-6 pt-0', this.userClass()));
}

export const HlmCardImports = [
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardDescription,
  HlmCardContent,
  HlmCardFooter,
] as const;
