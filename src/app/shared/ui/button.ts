import { Directive, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer select-none [&_ng-icon]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md',
        accent:
          'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent/10 hover:border-accent hover:text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent/10 hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

@Directive({
  selector: '[hlmBtn]',
  host: { '[class]': '_computed()' },
})
export class HlmButton {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>('default');
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly _computed = computed(() =>
    cn(buttonVariants({ variant: this.variant(), size: this.size() }), this.userClass()),
  );
}
