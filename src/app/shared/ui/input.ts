import { Directive, computed, input } from '@angular/core';
import { cn } from '../utils/cn';

@Directive({ selector: '[hlmInput]', host: { '[class]': '_c()' } })
export class HlmInput {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() =>
    cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors',
      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.userClass(),
    ),
  );
}

@Directive({ selector: '[hlmLabel]', host: { '[class]': '_c()' } })
export class HlmLabel {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() =>
    cn('text-sm font-medium leading-none text-foreground', this.userClass()),
  );
}
