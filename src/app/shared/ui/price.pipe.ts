import { ChangeDetectorRef, Pipe, PipeTransform, effect, inject } from '@angular/core';
import { StoreConfigService } from '../../core/store-config.service';

/**
 * Formats a numeric amount using the store's configured currency (symbol,
 * position, decimals, locale) from `StoreConfigService`.
 *
 * Impure so it recomputes when its host view is checked. To make a live
 * currency change (dev Theme Studio) reflect across OnPush/zoneless views, the
 * pipe marks its own view dirty whenever the currency signal changes — the same
 * pattern `AsyncPipe` uses.
 */
@Pipe({ name: 'price', standalone: true, pure: false })
export class PricePipe implements PipeTransform {
  private readonly config = inject(StoreConfigService);

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    effect(() => {
      this.config.currency();
      cdr.markForCheck();
    });
  }

  transform(value: number | null | undefined): string {
    return this.config.format(value);
  }
}
