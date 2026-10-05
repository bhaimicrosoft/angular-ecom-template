import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSkeleton } from '../ui/misc';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [HlmSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div hlmSkeleton class="aspect-square w-full rounded-none"></div>
      <div class="flex flex-col gap-3 p-4">
        <div hlmSkeleton class="h-3 w-16"></div>
        <div hlmSkeleton class="h-4 w-3/4"></div>
        <div hlmSkeleton class="h-3 w-24"></div>
        <div class="flex items-center justify-between pt-2">
          <div hlmSkeleton class="h-5 w-20"></div>
          <div hlmSkeleton class="h-8 w-8 rounded-md"></div>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardSkeleton {}
