import { Directive, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        outline: 'text-foreground border-border',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

@Directive({ selector: '[hlmBadge]', host: { '[class]': '_c()' } })
export class HlmBadge {
  readonly variant = input<BadgeVariant>('default');
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly _c = computed(() =>
    cn(badgeVariants({ variant: this.variant() }), this.userClass()),
  );
}
